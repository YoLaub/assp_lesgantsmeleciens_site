'use server';

import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { checkRateLimit } from '@/shared/lib/rate-limit';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import {
  sendBienvenueEssayant, sendNotificationNouvelEssayant,
  sendRelanceEssayant, sendConversionEssayant,
  sendNotificationConversionAdmin, sendLienAccesEssai,
} from '@/shared/lib/mail';
import { z } from 'zod';
import { createEssayantUseCase } from '../domain/use-cases/create-essayant.use-case';
import { requestAccesEssaiUseCase } from '../domain/use-cases/request-acces-essai.use-case';
import { getMonEssaiUseCase } from '../domain/use-cases/get-mon-essai.use-case';
import { pointerPresenceUseCase } from '../domain/use-cases/pointer-presence.use-case';
import { getEssayantConversionDataUseCase } from '../domain/use-cases/get-essayant-conversion-data.use-case';
import { getEssayantsForCoachUseCase } from '../domain/use-cases/get-essayants-for-coach.use-case';

const CreateEssayantSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().min(6),
  dateDeNaissance: z.string().refine((d) => !isNaN(Date.parse(d))),
  hcaptchaToken: z.string().min(1),
});

export async function createEssayantAction(input: z.infer<typeof CreateEssayantSchema>) {
  const allowed = await checkRateLimit('essai');
  if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const parsed = CreateEssayantSchema.safeParse(input);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  try {
    const { membre, numeroAdherent, accesToken } = await createEssayantUseCase({
      nom: parsed.data.nom,
      prenom: parsed.data.prenom,
      email: parsed.data.email,
      telephone: parsed.data.telephone,
      dateDeNaissance: new Date(parsed.data.dateDeNaissance),
    });

    try { await sendBienvenueEssayant({ email: membre.email, prenom: membre.prenom, numeroAdherent, accesToken }); }
    catch (e) { console.error('[createEssayantAction] mail', e); }
    try { await sendNotificationNouvelEssayant({ nom: membre.nom, prenom: membre.prenom, numeroAdherent, email: membre.email, telephone: membre.telephone ?? '' }); }
    catch (e) { console.error('[createEssayantAction] notif', e); }

    return { success: true, numeroAdherent };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Unique constraint') && msg.includes('email')) {
      return { success: false, error: 'Un profil essayant existe déjà avec cet email.' };
    }
    console.error('[createEssayantAction]', error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function requestAccesEssaiAction(input: { email: string; numeroAdherent: string; hcaptchaToken: string }) {
  const allowed = await checkRateLimit('acces-essai');
  if (!allowed) return { success: false, error: 'Trop de tentatives.' };

  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const result = await requestAccesEssaiUseCase(input.email, input.numeroAdherent);
  if (result) {
    try { await sendLienAccesEssai({ email: result.email, prenom: result.prenom, token: result.token }); }
    catch (e) { console.error('[requestAccesEssaiAction]', e); }
  }
  return { success: true };
}

export async function getMonEssaiAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  const data = await getMonEssaiUseCase(token);
  if (!data) return { success: false, error: 'Lien invalide ou expiré' };
  return { success: true, essayant: data, accesToken: data.accesToken };
}

export async function pointerPresenceAction(inscriptionId: number, coachToken: string, nomCoach: string) {
  const token = await prisma.coachToken.findFirst({ where: { token: coachToken, expireLe: { gt: new Date() } } });
  if (!token) return { success: false, error: 'Token coach invalide ou expiré' };

  const result = await pointerPresenceUseCase(inscriptionId, nomCoach);
  if (!result.success) return result;

  const { nouvPresences, bloque, membre, newToken } = result;

  if (nouvPresences === 1 || nouvPresences === 2) {
    try { await sendRelanceEssayant({ email: membre.email, prenom: membre.prenom, numeroAdherent: membre.numeroAdherent ?? '', nombrePresences: nouvPresences }); }
    catch (e) { console.error('[pointerPresenceAction] relance', e); }
  }

  if (bloque) {
    if (newToken) {
      try { await sendConversionEssayant({ email: membre.email, prenom: membre.prenom, numeroAdherent: membre.numeroAdherent ?? '', accesToken: newToken }); }
      catch (e) { console.error('[pointerPresenceAction] conversion', e); }
    }
    try {
      const m = await prisma.membre.findFirst({ where: { email: membre.email }, select: { nom: true } });
      await sendNotificationConversionAdmin({ nom: m?.nom ?? '', prenom: membre.prenom, numeroAdherent: membre.numeroAdherent ?? '' });
    }
    catch (e) { console.error('[pointerPresenceAction] notifAdmin', e); }
  }

  return { success: true, nombrePresences: nouvPresences };
}

export async function getEssayantConversionDataAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  const data = await getEssayantConversionDataUseCase(token);
  if (!data) return { success: false, error: 'Lien invalide ou expiré' };
  return { success: true, data };
}

export async function genererCoachTokenAction() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Non autorisé' };
  const token = crypto.randomUUID();
  const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.coachToken.create({ data: { token, expireLe, creePar: userId } });
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/coach?token=${token}`;
  return { success: true, url, token, expireLe };
}

export async function getCoachTokenActifAction() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Non autorisé' };
  const coachToken = await prisma.coachToken.findFirst({ orderBy: { creeLe: 'desc' } });
  if (!coachToken) return { success: true, token: null };
  return { success: true, token: { id: coachToken.id, expireLe: coachToken.expireLe, actif: coachToken.expireLe > new Date(), url: `${process.env.NEXT_PUBLIC_APP_URL}/coach?token=${coachToken.token}` } };
}

export async function getEssayantsForCoachAction(coachToken: string) {
  const token = await prisma.coachToken.findFirst({ where: { token: coachToken, expireLe: { gt: new Date() } } });
  if (!token) return { success: false, error: 'Token invalide ou expiré' };
  const essayants = await getEssayantsForCoachUseCase();
  return { success: true, essayants };
}

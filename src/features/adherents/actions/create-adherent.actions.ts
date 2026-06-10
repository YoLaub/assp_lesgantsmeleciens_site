'use server';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { checkRateLimit } from '@/shared/lib/rate-limit';
import { sendConfirmationInscription, sendNotificationNouveauDossier } from '@/shared/lib/mail';
import { z } from 'zod';
import { createAdherentUseCase } from '../domain/use-cases/create-adherent.use-case';

const CreateAdherentSchema = z.object({
  nom: z.string().min(1), prenom: z.string().min(1),
  dateDeNaissance: z.string().refine((d) => !isNaN(Date.parse(d))),
  sexe: z.enum(['M', 'F', 'autre']),
  email: z.string().email(),
  telephone1: z.string().optional(),
  oxygene: z.boolean().default(false),
  couponSport: z.boolean().default(false),
  bonCaf: z.boolean().default(false),
  codePassSport: z.string().optional(),
  hcaptchaToken: z.string().min(1),
  membreId: z.string().optional(),
});

export type CreateAdherentInput = z.infer<typeof CreateAdherentSchema>;

export async function createAdherentAction(input: CreateAdherentInput) {
  const allowed = await checkRateLimit('adhesion');
  if (!allowed) return { success: false, error: 'Trop de tentatives.' };

  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const parsed = CreateAdherentSchema.safeParse(input);
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

  const d = parsed.data;
  try {
    const { membre, numeroAdherent, montant, categorie } = await createAdherentUseCase({
      nom: d.nom, prenom: d.prenom, dateDeNaissance: new Date(d.dateDeNaissance),
      sexe: d.sexe, email: d.email, telephone: d.telephone1,
      oxygene: d.oxygene, couponSport: d.couponSport, bonCaf: d.bonCaf,
      codePassSport: d.codePassSport, membreId: d.membreId,
    });

    try { await sendConfirmationInscription({ email: membre.email, prenom: membre.prenom, numeroAdherent, certificatRequis: false }); }
    catch (e) { console.error('[createAdherentAction] mail', e); }
    try { await sendNotificationNouveauDossier({ nom: membre.nom, prenom: membre.prenom, numeroAdherent, categorie: String(categorie), montant, typePaiement: null, certificatRequis: false, adherentId: membre.id }); }
    catch (e) { console.error('[createAdherentAction] notif', e); }

    return { success: true, numeroAdherent };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('Unique constraint') && msg.includes('email')) return { success: false, error: 'Un dossier existe déjà avec cet email.' };
    console.error('[createAdherentAction]', error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
  }
}

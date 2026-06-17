'use server';

import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { checkRateLimit } from '@/shared/lib/rate-limit';
import { sendLienAccesDossier } from '@/shared/lib/mail';
import { hashToken } from '@/shared/lib/token';
import { z } from 'zod';
import { prisma } from '@/shared/lib/prisma';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import { getMonDossierUseCase } from '../domain/use-cases/get-mon-dossier.use-case';
import { soumettreQuestionnaireUseCase } from '../domain/use-cases/soumettre-questionnaire.use-case';
import { signerReglementUseCase } from '../domain/use-cases/signer-reglement.use-case';
import { setTypePaiementUseCase } from '../domain/use-cases/set-type-paiement.use-case';
import { patchAutorisationSortieUseCase } from '../domain/use-cases/patch-autorisation-sortie.use-case';
import { updateTelephoneUseCase } from '../domain/use-cases/update-telephone.use-case';
import { updateAdresseUseCase } from '../domain/use-cases/update-adresse.use-case';
import { updateDroitImageUseCase } from '../domain/use-cases/update-droit-image.use-case';
import { validerEngagementUseCase } from '../domain/use-cases/valider-engagement.use-case';
import { uploadDocumentAdherentUseCase } from '../domain/use-cases/upload-document-adherent.use-case';
import { createCheckoutUseCase } from '../domain/use-cases/create-checkout.use-case';

export async function requestAccesDossierAction(input: { email: string; numeroAdherent: string; hcaptchaToken: string }) {
  const allowed = await checkRateLimit('acces-dossier');
  if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

  const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const membre = await prisma.membre.findFirst({ where: { email: input.email, numeroAdherent: input.numeroAdherent } });
  if (membre) {
    const token = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.membre.update({ where: { id: membre.id }, data: { accesToken: hashToken(token), accesTokenExpireLe: expireLe } });
    try { await sendLienAccesDossier({ email: membre.email, prenom: membre.prenom, token }); }
    catch (e) { console.error('[requestAccesDossierAction]', e); }
  }
  return { success: true };
}

export async function getMonDossierAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  const data = await getMonDossierUseCase(token);
  if (!data) return { success: false, error: 'Lien invalide ou expiré' };
  return { success: true, adherent: data };
}

const QuestionnaireSchema = z.object({
  q1: z.boolean(), q2: z.boolean(), q3: z.boolean(), q4: z.boolean(),
  q5: z.boolean(), q6: z.boolean(), q7: z.boolean(),
});

export async function soumettreQuestionnaireAction(token: string, reponses: z.infer<typeof QuestionnaireSchema>, consentementSante: boolean) {
  if (!token) return { success: false, error: 'Token manquant' };
  if (consentementSante !== true) return { success: false, error: 'Consentement requis' };
  const parsed = QuestionnaireSchema.safeParse(reponses);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  const result = await soumettreQuestionnaireUseCase(inscription.id, 'majeur', parsed.data);
  return { success: true, certificatMedicalReq: result.certificatMedicalReq };
}

const QuestionnaireEnfantSchema = z.object({
  q1: z.boolean(), q2: z.boolean(), q3: z.boolean(), q4: z.boolean(),
  q5: z.boolean(), q6: z.boolean(), q7: z.boolean(), q8: z.boolean(),
  q9: z.boolean(), q10: z.boolean(), q11: z.boolean(), q12: z.boolean(),
  q13: z.boolean(), q14: z.boolean(), q15: z.boolean(), q16: z.boolean(),
  q17: z.boolean(), q18: z.boolean(), q19: z.boolean(), q20: z.boolean(),
  q21: z.boolean(), q22: z.boolean(), q23: z.boolean(), q24: z.boolean(),
});

export async function soumettreQuestionnaireEnfantAction(token: string, reponses: z.infer<typeof QuestionnaireEnfantSchema>, consentementSante: boolean) {
  if (!token) return { success: false, error: 'Token manquant' };
  if (consentementSante !== true) return { success: false, error: 'Consentement requis' };
  const parsed = QuestionnaireEnfantSchema.safeParse(reponses);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  const result = await soumettreQuestionnaireUseCase(inscription.id, 'mineur', parsed.data);
  return { success: true, certificatMedicalReq: result.certificatMedicalReq };
}

export async function signerReglementAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await signerReglementUseCase(inscription.id);
  return { success: true };
}

export async function setTypePaiementAction(token: string, typePaiement: 'sur_place' | 'en_ligne') {
  if (!token) return { success: false, error: 'Token manquant' };
  if (!['sur_place', 'en_ligne'].includes(typePaiement)) return { success: false, error: 'Valeur invalide' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await setTypePaiementUseCase(inscription.id, typePaiement);
  return { success: true };
}

export async function patchAutorisationSortieAction(token: string, autorise: boolean) {
  if (!token) return { success: false, error: 'Token manquant' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await patchAutorisationSortieUseCase(inscription.id, autorise);
  return { success: true };
}

const UpdateTelephoneSchema = z.object({
  telephone1: z.string().min(6),
  telephone2: z.string().optional(),
});

export async function updateTelephoneAction(token: string, data: z.infer<typeof UpdateTelephoneSchema>) {
  if (!token) return { success: false, error: 'Token manquant' };
  const parsed = UpdateTelephoneSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Numéro invalide' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await updateTelephoneUseCase({ id: inscription.id, membreId: inscription.membreId }, parsed.data.telephone1, parsed.data.telephone2);
  return { success: true };
}

const UpdateAdresseSchema = z.object({
  adresse: z.string().min(3),
  codePostal: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  codeInsee: z.string().regex(/^[0-9A-Z]{5}$/i, 'Code INSEE invalide'),
  communeNom: z.string().min(1),
});

export async function updateAdresseAction(token: string, data: z.infer<typeof UpdateAdresseSchema>) {
  if (!token) return { success: false, error: 'Token manquant' };
  const parsed = UpdateAdresseSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Adresse invalide' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await updateAdresseUseCase(inscription.membreId, parsed.data);
  return { success: true };
}

export async function updateDroitImageAction(token: string, droitImage: boolean) {
  if (!token) return { success: false, error: 'Token manquant' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await updateDroitImageUseCase(inscription.id, droitImage);
  return { success: true };
}

export async function validerEngagementAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  await validerEngagementUseCase(inscription.id);
  return { success: true };
}

const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAILLE_MAX = 5 * 1024 * 1024;

export async function uploadDocumentAdherentAction(token: string, formData: FormData, type: 'MEDICAL_CERTIFICATE' | 'ID_PHOTO') {
  if (!token) return { success: false, error: 'Token manquant' };
  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'Aucun fichier fourni' };
  if (!TYPES_AUTORISES.includes(file.type)) return { success: false, error: 'Format non accepté (JPEG, PNG, WebP, PDF uniquement)' };
  if (file.size > TAILLE_MAX) return { success: false, error: 'Fichier trop volumineux (5 Mo max)' };
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return { success: false, error: 'Lien invalide ou expiré' };
  try {
    const url = await uploadDocumentAdherentUseCase(inscription.id, file, type);
    return { success: true as const, url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur lors de l'upload";
    return { success: false as const, error: msg };
  }
}

export async function createCheckoutAction(token: string) {
  if (!token) return { success: false, error: 'Token manquant' };
  try {
    const url = await createCheckoutUseCase(token, process.env.NEXT_PUBLIC_APP_URL!);
    return { success: true, url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    return { success: false, error: msg };
  }
}

const RenouvellementSchema = z.object({
  email: z.string().email(),
  hcaptchaToken: z.string().min(1),
});

/**
 * Renouvellement : envoie un lien d'accès au dossier à l'email fourni s'il
 * correspond à un membre. Ne renvoie JAMAIS de données personnelles au client
 * (anti-énumération) — la réponse est identique que le membre existe ou non, et
 * le lien d'accès n'arrive que dans la boîte mail du propriétaire légitime.
 */
export async function demanderLienRenouvellementAction(input: { email: string; hcaptchaToken: string }) {
  const allowed = await checkRateLimit('renouvellement');
  if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

  const parsed = RenouvellementSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Email invalide' };

  const captchaOk = await verifyHCaptcha(parsed.data.hcaptchaToken);
  if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

  const membre = await prisma.membre.findFirst({ where: { email: parsed.data.email } });
  if (membre) {
    const token = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.membre.update({ where: { id: membre.id }, data: { accesToken: hashToken(token), accesTokenExpireLe: expireLe } });
    try { await sendLienAccesDossier({ email: membre.email, prenom: membre.prenom, token }); }
    catch (e) { console.error('[demanderLienRenouvellementAction]', e); }
  }
  // Réponse uniforme : aucune fuite sur l'existence ou les données du membre.
  return { success: true };
}

'use server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendDocumentValide, sendDocumentRejete, sendBonCafValide, sendNotificationRejetDossier } from '@/shared/lib/mail';
import { toCsv } from '@/shared/lib/csv';
import { getAdherentsUseCase } from '../domain/use-cases/admin/get-adherents.use-case';
import { getAdherentByIdUseCase } from '../domain/use-cases/admin/get-adherent-by-id.use-case';
import { patchAdherentUseCase } from '../domain/use-cases/admin/patch-adherent.use-case';
import { validerDocumentUseCase } from '../domain/use-cases/admin/valider-document.use-case';
import { notifierRejetDossierUseCase } from '../domain/use-cases/admin/notifier-rejet-dossier.use-case';

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('Non autorisé');
  return userId;
}

const PatchAdherentSchema = z.object({
  renouvellement: z.boolean().optional(), fnsmr: z.boolean().optional(),
  reglementSigne: z.enum(['non_fourni', 'declare', 'valide']).optional(),
  certificatMedical: z.enum(['non_fourni', 'declare', 'valide']).optional(),
  autorisationParentale: z.enum(['non_fourni', 'declare', 'valide']).optional(),
  couponSport: z.enum(['non_fourni', 'declare', 'valide']).optional(),
  bonCaf: z.enum(['non_fourni', 'declare', 'valide']).optional(),
  inscriptionValide: z.boolean().optional(),
});

export async function getAdherentsAction() {
  await requireAdmin();
  return getAdherentsUseCase();
}

export async function getAdherentByIdAction(id: number) {
  await requireAdmin();
  return getAdherentByIdUseCase(id);
}

const STATUT_DOC_LABEL: Record<string, string> = { non_fourni: 'Non fourni', declare: 'Déclaré', valide: 'Validé' };
const PAIEMENT_LABEL: Record<string, string> = { en_ligne: 'En ligne', sur_place: 'Sur place' };
const formatDate = (d: Date | null | undefined) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');

/** Export CSV de tous les adhérents (séparateur ';' + BOM, lisible dans Excel FR). */
export async function exportAdherentsCsvAction() {
  await requireAdmin();
  const adherents = await getAdherentsUseCase();

  const headers = [
    'Numéro adhérent', 'Nom', 'Prénom', 'Date de naissance', 'Catégorie',
    'Montant (€)', 'Mode de paiement', 'Inscription validée', 'Date inscription',
    'Règlement signé', 'Certificat médical', 'Certificat requis',
    'Autorisation sortie seul', 'Pass Sport', 'Bon CAF',
  ];

  const rows = adherents.map((a) => [
    a.membre.numeroAdherent ?? '',
    a.membre.nom,
    a.membre.prenom,
    formatDate(a.membre.dateDeNaissance),
    a.categorie ?? '',
    a.montantSnapshot !== null ? Number(a.montantSnapshot).toFixed(2) : '',
    a.typePaiement ? (PAIEMENT_LABEL[a.typePaiement] ?? a.typePaiement) : '',
    a.inscriptionValide ? 'Oui' : 'Non',
    formatDate(a.dateInscription),
    STATUT_DOC_LABEL[a.reglementSigne] ?? a.reglementSigne,
    STATUT_DOC_LABEL[a.certificatMedical] ?? a.certificatMedical,
    a.certificatMedicalReq ? 'Oui' : 'Non',
    a.autorisationSortieSeul === true ? 'Autorisé' : a.autorisationSortieSeul === false ? 'Non autorisé' : 'Non renseigné',
    STATUT_DOC_LABEL[a.couponSport] ?? a.couponSport,
    STATUT_DOC_LABEL[a.bonCaf] ?? a.bonCaf,
  ]);

  const today = new Date().toISOString().split('T')[0];
  return { csv: toCsv(headers, rows), filename: `adherents_${today}.csv` };
}

export async function patchAdherentAction(id: number, data: z.infer<typeof PatchAdherentSchema>) {
  await requireAdmin();
  const parsed = PatchAdherentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  await patchAdherentUseCase(id, parsed.data as Parameters<typeof patchAdherentUseCase>[1]);
  revalidatePath('/admin/club/adherents');
  revalidatePath(`/admin/club/adherents/${id}`);
  return { success: true };
}

const LABELS_DOCUMENTS: Record<string, string> = { certificatMedical: 'certificat médical', autorisationParentale: 'autorisation parentale', reglementSigne: 'règlement intérieur', couponSport: 'Pass Sport', bonCaf: 'aide CAF' };

export async function validerDocumentAdminAction(
  id: number,
  field: 'certificatMedical' | 'autorisationParentale' | 'reglementSigne' | 'couponSport' | 'bonCaf',
  statut: 'valide' | 'non_fourni'
) {
  await requireAdmin();
  const { email, prenom } = await validerDocumentUseCase(id, field, statut);
  if (!email || !prenom) return { success: false, error: 'Adhérent introuvable' };
  revalidatePath('/admin/club/adherents');
  revalidatePath(`/admin/club/adherents/${id}`);
  const label = LABELS_DOCUMENTS[field] ?? field;
  try {
    if (statut === 'valide') { field === 'bonCaf' ? await sendBonCafValide({ email, prenom }) : await sendDocumentValide({ email, prenom, labelDocument: label }); }
    else { await sendDocumentRejete({ email, prenom, labelDocument: label }); }
  } catch (e) { console.error('[validerDocumentAdminAction]', e); }
  return { success: true };
}

export async function notifierRejetDossierAction(id: number) {
  await requireAdmin();
  try {
    const { email, prenom } = await notifierRejetDossierUseCase(id);
    await sendNotificationRejetDossier({ email, prenom });
    return { success: true };
  } catch (e) {
    console.error('[notifierRejetDossierAction]', e);
    return { success: false, error: "Erreur lors de l'envoi de l'email" };
  }
}

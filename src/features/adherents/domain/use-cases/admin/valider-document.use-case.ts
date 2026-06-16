import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
type DocumentField = 'certificatMedical' | 'autorisationParentale' | 'reglementSigne' | 'couponSport' | 'bonCaf';
export async function validerDocumentUseCase(id: number, field: DocumentField, statut: 'valide' | 'non_fourni') {
  await inscriptionRepository.update(id, { [field]: statut } as Parameters<typeof inscriptionRepository.update>[1]);
  const inscription = await inscriptionRepository.findAdherentById(id);
  return { email: inscription?.membre.email, prenom: inscription?.membre.prenom };
}

import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function setTypePaiementUseCase(inscriptionId: number, typePaiement: 'sur_place' | 'en_ligne') {
  await inscriptionRepository.update(inscriptionId, { typePaiement });
}

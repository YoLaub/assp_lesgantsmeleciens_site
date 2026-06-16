import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function signerReglementUseCase(inscriptionId: number) {
  await inscriptionRepository.update(inscriptionId, { reglementSigne: 'declare' });
}

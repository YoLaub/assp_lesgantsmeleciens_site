import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function validerEngagementUseCase(inscriptionId: number) {
  await inscriptionRepository.update(inscriptionId, { engagementPrisConnaissance: true });
}

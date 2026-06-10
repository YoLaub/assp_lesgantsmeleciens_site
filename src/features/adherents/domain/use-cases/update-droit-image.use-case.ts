import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function updateDroitImageUseCase(inscriptionId: number, droitImage: boolean) {
  await inscriptionRepository.update(inscriptionId, { droitImage });
}

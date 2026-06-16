import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function getAdherentByIdUseCase(id: number) {
  return inscriptionRepository.findAdherentById(id);
}

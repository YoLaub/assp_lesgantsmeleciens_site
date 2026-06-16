import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function getAdherentsUseCase() {
  return inscriptionRepository.findAllAdherents();
}

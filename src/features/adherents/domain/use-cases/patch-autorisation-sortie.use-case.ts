import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function patchAutorisationSortieUseCase(inscriptionId: number, autorise: boolean) {
  await inscriptionRepository.update(inscriptionId, { autorisationSortieSeul: autorise });
}

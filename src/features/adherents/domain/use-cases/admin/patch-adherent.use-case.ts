import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import type { Inscription } from '@/features/adhesion/domain/models/inscription.model';

const CHAMPS_AUTORISES: (keyof Inscription)[] = [
  'renouvellement', 'fnsmr', 'reglementSigne', 'certificatMedical',
  'autorisationParentale', 'couponSport', 'bonCaf', 'inscriptionValide',
];

export async function patchAdherentUseCase(id: number, data: Partial<Inscription>) {
  const safeData = Object.fromEntries(
    Object.entries(data).filter(([key]) => CHAMPS_AUTORISES.includes(key as keyof Inscription))
  ) as Partial<Inscription>;
  await inscriptionRepository.update(id, safeData);
}

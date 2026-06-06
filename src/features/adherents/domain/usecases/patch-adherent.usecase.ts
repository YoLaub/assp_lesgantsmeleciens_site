import { ResultAsync, errAsync } from '@/shared/lib/result';
import { PatchAdherentData } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

const CHAMPS_AUTORISES: (keyof PatchAdherentData)[] = [
    'renouvellement',
    'fnsmr',
    'reglementSigne',
    'certificatMedical',
    'autorisationParentale',
    'couponSport',
    'bonCaf',
    'inscriptionValide',
];

export class PatchAdherentUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(id: number, data: Partial<PatchAdherentData>): ResultAsync<void, string> {
        const safeData = Object.fromEntries(
            Object.entries(data).filter(([key]) => CHAMPS_AUTORISES.includes(key as keyof PatchAdherentData)),
        ) as PatchAdherentData;

        if (Object.keys(safeData).length === 0) return errAsync('Aucun champ autorisé fourni');

        return this.repository.patchAdherent(id, safeData);
    }
}

import { ResultAsync, errAsync } from '@/shared/lib/result';
import { AdherentRepository } from '../repositories/adherent.repository';

export class UpdateTelephoneUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherentId: number, telephone1: string, telephone2?: string): ResultAsync<void, string> {
        if (!telephone1 || telephone1.length < 6) return errAsync('Numéro invalide');
        return this.repository.patchAdherent(adherentId, {
            telephone1,
            telephone2: telephone2 ?? null,
        });
    }
}

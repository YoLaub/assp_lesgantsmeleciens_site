import { ResultAsync, errAsync } from '@/shared/lib/result';
import { AdherentWithDetails } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class GetAdherentByIdUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(id: number): ResultAsync<AdherentWithDetails, string> {
        return this.repository.findById(id).andThen((adherent) => {
            if (!adherent) return errAsync('Adhérent introuvable');
            return ResultAsync.fromSafePromise(Promise.resolve(adherent));
        });
    }
}

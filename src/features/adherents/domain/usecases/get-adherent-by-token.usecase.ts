import { ResultAsync, errAsync } from '@/shared/lib/result';
import { AdherentWithDetails } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class GetAdherentByTokenUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(token: string): ResultAsync<AdherentWithDetails, string> {
        if (!token) return errAsync('Token manquant');

        return this.repository.findByToken(token).andThen((adherent) => {
            if (!adherent) return errAsync('Lien invalide ou expiré');
            return ResultAsync.fromSafePromise(Promise.resolve(adherent));
        });
    }
}

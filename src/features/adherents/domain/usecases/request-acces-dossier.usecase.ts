import { ResultAsync, okAsync } from '@/shared/lib/result';
import { Adherent } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export interface RequestAccesDossierResult {
    found: boolean;
    adherent?: Adherent;
    token?: string;
}

export class RequestAccesDossierUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(email: string, numeroAdherent: string): ResultAsync<RequestAccesDossierResult, string> {
        return this.repository.findByEmailAndNumero(email, numeroAdherent).andThen((adherent) => {
            if (!adherent) return okAsync({ found: false });

            const token = crypto.randomUUID();
            const expireLe = new Date(Date.now() + 60 * 60 * 1000);

            return this.repository
                .updateToken(adherent.id, token, expireLe)
                .map(() => ({ found: true, adherent: { ...adherent, accesToken: token }, token }));
        });
    }
}

import { ResultAsync, okAsync } from '@/shared/lib/result';
import { Essayant } from '../models/essayant.model';
import { EssayantRepository } from '../repositories/essayant.repository';

export interface RequestAccesEssaiResult {
    found: boolean;
    essayant?: Essayant;
    token?: string;
}

export class RequestAccesEssaiUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(email: string, numeroAdherent: string): ResultAsync<RequestAccesEssaiResult, string> {
        return this.repository.findByEmailAndNumero(email, numeroAdherent).andThen((essayant) => {
            if (!essayant) return okAsync({ found: false });

            const token = crypto.randomUUID();
            const expireLe = new Date(Date.now() + 60 * 60 * 1000);

            return this.repository
                .updateToken(essayant.id, token, expireLe)
                .map(() => ({ found: true, essayant: { ...essayant, accesToken: token }, token }));
        });
    }
}

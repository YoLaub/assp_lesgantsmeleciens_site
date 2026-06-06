import { ResultAsync, errAsync } from '@/shared/lib/result';
import { Essayant } from '../models/essayant.model';
import { EssayantRepository } from '../repositories/essayant.repository';

export class GetEssayantByTokenUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(token: string): ResultAsync<Essayant, string> {
        if (!token) return errAsync('Token manquant');

        return this.repository.findByToken(token).andThen((essayant) => {
            if (!essayant) return errAsync('Lien invalide ou expiré');
            return ResultAsync.fromSafePromise(Promise.resolve(essayant));
        });
    }
}

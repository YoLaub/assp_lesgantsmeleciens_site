import { ResultAsync, errAsync } from '@/shared/lib/result';
import { EssayantForCoach } from '../models/essayant.model';
import { EssayantRepository } from '../repositories/essayant.repository';

export class GetEssayantsForCoachUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(coachToken: string): ResultAsync<EssayantForCoach[], string> {
        return this.repository.findCoachToken(coachToken).andThen((token) => {
            if (!token) return errAsync('Token invalide ou expiré');
            return this.repository.findAllNonConvertis();
        });
    }
}

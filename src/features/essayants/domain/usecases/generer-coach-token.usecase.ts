import { ResultAsync } from '@/shared/lib/result';
import { CoachToken } from '../models/essayant.model';
import { EssayantRepository } from '../repositories/essayant.repository';

export class GenererCoachTokenUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(userId: string): ResultAsync<CoachToken, string> {
        const token = crypto.randomUUID();
        const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return this.repository.createCoachToken(token, expireLe, userId);
    }
}

import { ResultAsync } from '@/shared/lib/result';
import { CoachToken } from '../models/essayant.model';
import { EssayantRepository } from '../repositories/essayant.repository';

export class GetCoachTokenActifUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(): ResultAsync<CoachToken | null, string> {
        return this.repository.getLatestCoachToken();
    }
}

import { ResultAsync } from '@/shared/lib/result';
import { AdherentWithQuestionnaire } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class GetAdherentsUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(): ResultAsync<AdherentWithQuestionnaire[], string> {
        return this.repository.findAll();
    }
}

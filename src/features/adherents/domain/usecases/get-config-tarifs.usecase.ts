import { ResultAsync } from '@/shared/lib/result';
import { ConfigTarifs } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class GetConfigTarifsUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(): ResultAsync<ConfigTarifs | null, string> {
        return this.repository.getConfigTarifs();
    }
}

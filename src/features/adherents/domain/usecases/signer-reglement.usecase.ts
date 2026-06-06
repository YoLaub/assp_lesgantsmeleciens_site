import { ResultAsync } from '@/shared/lib/result';
import { AdherentRepository } from '../repositories/adherent.repository';

export class SignerReglementUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherentId: number): ResultAsync<void, string> {
        return this.repository.patchAdherent(adherentId, { reglementSigne: 'declare' });
    }
}

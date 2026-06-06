import { ResultAsync } from '@/shared/lib/result';
import { AdherentRepository } from '../repositories/adherent.repository';

export class UpdateDroitImageUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherentId: number, droitImage: boolean): ResultAsync<void, string> {
        return this.repository.patchAdherent(adherentId, { droitImage });
    }
}

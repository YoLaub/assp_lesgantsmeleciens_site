import { ResultAsync, errAsync } from '@/shared/lib/result';
import { TypePaiement } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class SetTypePaiementUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherentId: number, typePaiement: TypePaiement): ResultAsync<void, string> {
        if (!['sur_place', 'en_ligne'].includes(typePaiement)) {
            return errAsync('Valeur invalide');
        }
        return this.repository.patchAdherent(adherentId, { typePaiement });
    }
}

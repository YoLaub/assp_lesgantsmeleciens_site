import { ResultAsync, errAsync } from '@/shared/lib/result';
import { PatchAdherentData, StatutDocument } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

type DocumentField = 'certificatMedical' | 'autorisationParentale' | 'reglementSigne' | 'couponSport' | 'bonCaf';

export interface ValiderDocumentResult {
    email: string;
    prenom: string;
    field: DocumentField;
    statut: 'valide' | 'non_fourni';
}

export class ValiderDocumentAdminUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(
        id: number,
        field: DocumentField,
        statut: 'valide' | 'non_fourni',
    ): ResultAsync<ValiderDocumentResult, string> {
        return this.repository.findById(id).andThen((adherent) => {
            if (!adherent) return errAsync('Adhérent introuvable');

            const patch: PatchAdherentData = { [field]: statut as StatutDocument };

            return this.repository
                .patchAdherent(id, patch)
                .map(() => ({
                    email: adherent.email,
                    prenom: adherent.prenom,
                    field,
                    statut,
                }));
        });
    }
}

import { ResultAsync, errAsync } from '@/shared/lib/result';
import { AdherentWithDetails } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export interface CheckoutValidationResult {
    adherentId: number;
    montantSnapshot: number;
}

function isMineur(dateDeNaissance: Date): boolean {
    const today = new Date();
    let age = today.getFullYear() - dateDeNaissance.getFullYear();
    const moisDiff = today.getMonth() - dateDeNaissance.getMonth();
    if (moisDiff < 0 || (moisDiff === 0 && today.getDate() < dateDeNaissance.getDate())) age--;
    return age < 18;
}

export class ValidateCheckoutAdherentUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherent: AdherentWithDetails): ResultAsync<CheckoutValidationResult, string> {
        if (adherent.typePaiement !== 'en_ligne') {
            return errAsync('Mode de paiement non applicable');
        }
        if (adherent.inscriptionValide) {
            return errAsync('Inscription déjà validée');
        }
        if (!adherent.montantSnapshot) {
            return errAsync('Montant introuvable');
        }

        const documentsRequis = [
            adherent.reglementSigne,
            ...(adherent.certificatMedicalReq ? [adherent.certificatMedical] : []),
            ...(isMineur(adherent.dateDeNaissance) ? [adherent.autorisationParentale] : []),
        ];

        const tousValides = documentsRequis.every((s) => s === 'valide');
        if (!tousValides) {
            return errAsync('Documents en attente de validation');
        }

        return ResultAsync.fromSafePromise(
            Promise.resolve({
                adherentId: adherent.id,
                montantSnapshot: adherent.montantSnapshot,
            }),
        );
    }
}

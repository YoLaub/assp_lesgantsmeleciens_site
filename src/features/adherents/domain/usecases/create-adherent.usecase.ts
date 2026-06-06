import { ResultAsync, errAsync } from '@/shared/lib/result';
import { calculerCategorie } from '@/shared/lib/adherent-utils';
import { Adherent, ConfigTarifs, StatutDocument } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export interface CreateAdherentInput {
    nom: string;
    prenom: string;
    dateDeNaissance: Date;
    sexe: 'M' | 'F' | 'autre';
    email: string;
    telephone1?: string;
    oxygene: boolean;
    couponSport: boolean;
    bonCaf: boolean;
    codePassSport?: string;
    essayantId?: number;
    numeroAdherent: string;
    renouvellement: boolean;
    config: ConfigTarifs;
}

export class CreateAdherentUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(input: CreateAdherentInput): ResultAsync<Adherent, string> {
        if (!input.nom?.trim()) return errAsync('Le nom est requis');
        if (!input.prenom?.trim()) return errAsync('Le prénom est requis');

        const categorie = calculerCategorie(input.dateDeNaissance);
        const tarifBase = categorie === 'enfant'
            ? input.config.tarifEnfant
            : input.config.tarifAdulte;

        let montant = tarifBase;
        if (input.oxygene) montant += input.config.supplementOxygene;
        if (input.couponSport) montant -= input.config.deductionCouponSport;

        const couponSportStatut: StatutDocument = input.couponSport ? 'declare' : 'non_fourni';
        const bonCafStatut: StatutDocument = input.bonCaf ? 'declare' : 'non_fourni';

        return this.repository
            .createAdherent({
                numeroAdherent: input.numeroAdherent,
                nom: input.nom.trim(),
                prenom: input.prenom.trim(),
                dateDeNaissance: input.dateDeNaissance,
                sexe: input.sexe,
                email: input.email,
                telephone1: input.telephone1,
                oxygene: input.oxygene,
                categorie,
                renouvellement: input.renouvellement,
                couponSport: couponSportStatut,
                bonCaf: bonCafStatut,
                codePassSport: input.codePassSport,
                montantSnapshot: montant,
                essayantId: input.essayantId,
            })
            .andThen((adherent) => {
                if (!input.essayantId) return ResultAsync.fromSafePromise(Promise.resolve(adherent));
                return this.repository
                    .linkEssayant(adherent.id, input.essayantId)
                    .map(() => adherent);
            });
    }
}

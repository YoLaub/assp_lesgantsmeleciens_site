import { ResultAsync, errAsync } from '@/shared/lib/result';
import { EssayantRepository } from '../repositories/essayant.repository';

export interface EssayantConversionData {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateDeNaissance: string;
    numeroAdherent: string;
}

export class GetEssayantConversionDataUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(token: string): ResultAsync<EssayantConversionData, string> {
        if (!token) return errAsync('Token manquant');

        return this.repository.findByToken(token).andThen((essayant) => {
            if (!essayant) return errAsync('Lien invalide ou expiré');

            return ResultAsync.fromSafePromise(
                Promise.resolve({
                    id: essayant.id,
                    nom: essayant.nom,
                    prenom: essayant.prenom,
                    email: essayant.email,
                    telephone: essayant.telephone,
                    dateDeNaissance: essayant.dateDeNaissance.toISOString().split('T')[0],
                    numeroAdherent: essayant.numeroAdherent,
                }),
            );
        });
    }
}

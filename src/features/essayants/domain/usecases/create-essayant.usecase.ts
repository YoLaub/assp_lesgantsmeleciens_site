import { ResultAsync, errAsync } from '@/shared/lib/result';
import { Essayant } from '../models/essayant.model';
import { EssayantRepository } from '../repositories/essayant.repository';

export interface CreateEssayantInput {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateDeNaissance: Date;
    numeroAdherent: string;
}

export class CreateEssayantUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(input: CreateEssayantInput): ResultAsync<Essayant, string> {
        if (!input.nom || input.nom.trim().length < 1) return errAsync('Le nom est requis');
        if (!input.prenom || input.prenom.trim().length < 1) return errAsync('Le prénom est requis');
        if (!input.email || !input.email.includes('@')) return errAsync('Email invalide');

        const accesToken = crypto.randomUUID();
        const accesTokenExpireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return this.repository.createEssayant({
            numeroAdherent: input.numeroAdherent,
            nom: input.nom.trim(),
            prenom: input.prenom.trim(),
            email: input.email,
            telephone: input.telephone,
            dateDeNaissance: input.dateDeNaissance,
            accesToken,
            accesTokenExpireLe,
        });
    }
}

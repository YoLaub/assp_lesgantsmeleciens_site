import { Actualite } from '../models/actualite.model';
import { ActualiteRepository } from '../repositories/actualite.repository';

export class SaveActualiteUseCase {
    constructor(private repository: ActualiteRepository) {}

    async execute(actualite: Actualite): Promise<void> {
        if (!actualite.title || actualite.title.length < 3) {
            throw new Error("Le titre de l'actualité est trop court.");
        }

        return await this.repository.save(actualite);
    }
}

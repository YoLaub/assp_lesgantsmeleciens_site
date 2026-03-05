import { ActualiteRepository } from '../repositories/actualite.repository';
import { Actualite } from '../models/actualite.model';

export class GetFeaturedActualiteUseCase {
    constructor(private repository: ActualiteRepository) {}

    async execute(): Promise<Actualite | null> {
        return await this.repository.getFeatured();
    }
}

import { ActualiteRepository } from '../repositories/actualite.repository';
import { Actualite } from '../models/actualite.model';

export class GetAllActualitesUseCase {
    constructor(private repository: ActualiteRepository) {}

    async execute(): Promise<Actualite[]> {
        return await this.repository.getAll();
    }
}

import { ActualiteRepository } from '../repositories/actualite.repository';
import { Actualite } from '../models/actualite.model';

export class GetActualiteUseCase {
    constructor(private repository: ActualiteRepository) {}

    async execute(id: string): Promise<Actualite | null> {
        return await this.repository.getById(id);
    }
}

import { ActualiteRepository } from '../repositories/actualite.repository';

export class GetActiveActualitesUseCase {
    constructor(private repository: ActualiteRepository) {}

    async execute() {
        return await this.repository.getAllActive();
    }
}

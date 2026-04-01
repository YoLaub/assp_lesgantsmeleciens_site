import { ActualiteRepository } from '../repositories/actualite.repository';

export class ReorderActualitesUseCase {
    constructor(private repository: ActualiteRepository) {}

    async execute(items: { id: string; order: number }[]): Promise<void> {
        if (items.length === 0) return;
        return await this.repository.reorderMany(items);
    }
}

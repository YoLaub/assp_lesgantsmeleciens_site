import { DisciplineRepository } from '../repositories/discipline.repository';

export class ReorderDisciplinesUseCase {
    constructor(private repository: DisciplineRepository) {}

    async execute(items: { id: string; order: number }[]): Promise<void> {
        if (items.length === 0) return;
        return await this.repository.reorderMany(items);
    }
}

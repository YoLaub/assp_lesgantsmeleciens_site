import { DisciplineRepository } from '../repositories/discipline.repository';

export class GetActiveDisciplinesUseCase {
    constructor(private repository: DisciplineRepository) {}

    async execute() {
        // Ici on pourrait ajouter une logique de mise en cache (Next.js tags)
        return await this.repository.getAllActive();
    }
}
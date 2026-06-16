import { Discipline } from '../models/discipline.model';
import { DisciplineRepository } from '../repositories/discipline.repository';

export class SaveDisciplineUseCase {
    constructor(private repository: DisciplineRepository) {}

    async execute(discipline: Discipline): Promise<void> {
        // Logique métier : Validation
        if (!discipline.title || discipline.title.length < 3) {
            throw new Error("Le titre de la discipline est trop court.");
        }

        // Appel au repository
        return await this.repository.save(discipline);
    }
}
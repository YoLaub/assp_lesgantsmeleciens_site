import { DisciplineRepository } from '../repositories/discipline.repository';
import { Discipline } from '../../domain/models/discipline.model';

export class GetDisciplineUseCase {
    constructor(private repository: DisciplineRepository) {}

    async execute(id: string): Promise<Discipline | null> {

        // Appel au repository
        return await this.repository.getById(id);
    }
}
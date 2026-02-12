import { DisciplineRepository } from '../repositories/discipline.repository';
import { Discipline } from '../../domain/models/discipline.model';

export class GetAllDisciplinesUseCase {
    constructor(private repository: DisciplineRepository) {}

    async execute(): Promise<Discipline[]> {
        return await this.repository.getAll();
    }
}
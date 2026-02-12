import { Discipline } from '../../domain/models/discipline.model';
import { DisciplineRepository } from '../../domain/repositories/discipline.repository';
import { DisciplinePostgresDataSource } from '../datasources/discipline.postgres.datasource';

export class DisciplineRepositoryImpl implements DisciplineRepository {
    private dataSource: DisciplinePostgresDataSource;

    constructor() {
        this.dataSource = new DisciplinePostgresDataSource();
    }

    async save(discipline: Discipline): Promise<void> {
        return await this.dataSource.upsertDiscipline(discipline);
    }

    async getAll(): Promise<Discipline[]> {
        return await this.dataSource.getDisciplines();
    }

    async getById(id: string): Promise<Discipline | null> {
        return await this.dataSource.getDisciplineById(id);
    }

    async delete(id: string): Promise<void> {
        // Implémentation via prisma.discipline.delete...
    }
}
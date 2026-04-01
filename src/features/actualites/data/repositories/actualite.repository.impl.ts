import { Actualite } from '../../domain/models/actualite.model';
import { ActualiteRepository } from '../../domain/repositories/actualite.repository';
import { ActualitePostgresDataSource } from '../datasources/actualite.postgres.datasource';

export class ActualiteRepositoryImpl implements ActualiteRepository {
    private dataSource: ActualitePostgresDataSource;

    constructor() {
        this.dataSource = new ActualitePostgresDataSource();
    }

    async save(actualite: Actualite): Promise<void> {
        return await this.dataSource.upsertActualite(actualite);
    }

    async getAll(): Promise<Actualite[]> {
        return await this.dataSource.getActualites();
    }

    async getById(id: string): Promise<Actualite | null> {
        return await this.dataSource.getActualiteById(id);
    }

    async delete(id: string): Promise<void> {
        return await this.dataSource.deleteActualite(id);
    }

    async getAllActive(): Promise<Actualite[]> {
        return await this.dataSource.getActiveActualites();
    }

    async getFeatured(): Promise<Actualite | null> {
        return await this.dataSource.getFeaturedActualite();
    }

    async reorderMany(items: { id: string; order: number }[]): Promise<void> {
        return await this.dataSource.reorderActualites(items);
    }
}

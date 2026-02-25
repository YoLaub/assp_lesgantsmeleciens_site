import { GalleryImage } from '../../domain/models/gallery-image.model';
import { GalleryImageRepository } from '../../domain/repositories/gallery-image.repository';
import { GalleryImagePostgresDataSource } from '../datasources/gallery-image.postgres.datasource';

export class GalleryImageRepositoryImpl implements GalleryImageRepository {
    private dataSource: GalleryImagePostgresDataSource;

    constructor() {
        this.dataSource = new GalleryImagePostgresDataSource();
    }

    async getAll(): Promise<GalleryImage[]> {
        return await this.dataSource.getGalleryImages();
    }

    async getById(id: string): Promise<GalleryImage | null> {
        return await this.dataSource.getGalleryImageById(id);
    }

    async save(image: GalleryImage): Promise<void> {
        return await this.dataSource.upsertGalleryImage(image);
    }

    async delete(id: string): Promise<void> {
        return await this.dataSource.deleteGalleryImage(id);
    }

    async bulkDelete(ids: string[]): Promise<void> {
        return await this.dataSource.bulkDeleteGalleryImages(ids);
    }
}

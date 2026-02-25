import { ResultAsync } from '@/shared/lib/result';
import { GalleryImage } from '../../domain/models/gallery-image.model';
import { GalleryImageRepository } from '../../domain/repositories/gallery-image.repository';
import { GalleryImagePostgresDataSource } from '../datasources/gallery-image.postgres.datasource';

export class GalleryImageRepositoryImpl implements GalleryImageRepository {
    private dataSource: GalleryImagePostgresDataSource;

    constructor() {
        this.dataSource = new GalleryImagePostgresDataSource();
    }

    getAll(): ResultAsync<GalleryImage[], string> {
        return this.dataSource.getGalleryImages();
    }

    getById(id: string): ResultAsync<GalleryImage | null, string> {
        return this.dataSource.getGalleryImageById(id);
    }

    save(image: GalleryImage): ResultAsync<void, string> {
        return this.dataSource.upsertGalleryImage(image);
    }

    delete(id: string): ResultAsync<void, string> {
        return this.dataSource.deleteGalleryImage(id);
    }

    bulkDelete(ids: string[]): ResultAsync<void, string> {
        return this.dataSource.bulkDeleteGalleryImages(ids);
    }
}

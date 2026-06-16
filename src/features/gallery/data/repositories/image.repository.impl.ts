import { ResultAsync } from '@/shared/lib/result';
import { Image } from '../../domain/models/image.model';
import { ImageRepository } from '../../domain/repositories/image.repository';
import { ImagePostgresDataSource } from '../datasources/image.postgres.datasource';

export class ImageRepositoryImpl implements ImageRepository {
    private dataSource: ImagePostgresDataSource;

    constructor() {
        this.dataSource = new ImagePostgresDataSource();
    }

    getAll(): ResultAsync<Image[], string> {
        return this.dataSource.getImages();
    }

    getByCategory(categorySlug: string): ResultAsync<Image[], string> {
        return this.dataSource.getImagesByCategory(categorySlug);
    }

    getById(id: string): ResultAsync<Image | null, string> {
        return this.dataSource.getImageById(id);
    }

    getByIds(ids: string[]): ResultAsync<Image[], string> {
        return this.dataSource.getImagesByIds(ids);
    }

    save(image: Image): ResultAsync<void, string> {
        return this.dataSource.upsertImage(image);
    }

    saveMany(images: Image[]): ResultAsync<void, string> {
        return this.dataSource.createManyImages(images);
    }

    delete(id: string): ResultAsync<void, string> {
        return this.dataSource.deleteImage(id);
    }

    bulkDelete(ids: string[]): ResultAsync<void, string> {
        return this.dataSource.bulkDeleteImages(ids);
    }

    reorderMany(items: { id: string; order: number }[]): ResultAsync<void, string> {
        return this.dataSource.reorderImages(items);
    }
}

import { ResultAsync, okAsync } from '@/shared/lib/result';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class ReorderGalleryImagesUseCase {
    constructor(private repository: GalleryImageRepository) {}

    execute(items: { id: string; order: number }[]): ResultAsync<void, string> {
        if (items.length === 0) {
            return okAsync(undefined);
        }
        return this.repository.reorderMany(items);
    }
}

import { ResultAsync, okAsync } from '@/shared/lib/result';
import { ImageRepository } from '../repositories/image.repository';

export class ReorderGalleryImagesUseCase {
    constructor(private repository: ImageRepository) {}

    execute(items: { id: string; order: number }[]): ResultAsync<void, string> {
        if (items.length === 0) {
            return okAsync(undefined);
        }
        return this.repository.reorderMany(items);
    }
}

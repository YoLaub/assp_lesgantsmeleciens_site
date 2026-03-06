import { ResultAsync, errAsync } from '@/shared/lib/result';
import { ImageRepository } from '../repositories/image.repository';

export class BulkDeleteGalleryImagesUseCase {
    constructor(private repository: ImageRepository) {}

    execute(ids: string[]): ResultAsync<void, string> {
        if (!ids.length) {
            return errAsync("Aucune image sélectionnée pour la suppression.");
        }

        return this.repository.bulkDelete(ids);
    }
}

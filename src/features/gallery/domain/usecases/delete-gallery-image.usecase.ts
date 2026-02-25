import { ResultAsync } from '@/shared/lib/result';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class DeleteGalleryImageUseCase {
    constructor(private repository: GalleryImageRepository) {}

    execute(id: string): ResultAsync<void, string> {
        return this.repository.delete(id);
    }
}

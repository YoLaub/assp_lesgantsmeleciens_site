import { ResultAsync } from '@/shared/lib/result';
import { GalleryImage } from '../models/gallery-image.model';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class GetAllGalleryImagesUseCase {
    constructor(private repository: GalleryImageRepository) {}

    execute(): ResultAsync<GalleryImage[], string> {
        return this.repository.getAll();
    }
}

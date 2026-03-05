import { ResultAsync } from '@/shared/lib/result';
import { GalleryImage } from '../models/gallery-image.model';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class GetGalleryImagesByCategoryUseCase {
    constructor(private repository: GalleryImageRepository) {}

    execute(category: string): ResultAsync<GalleryImage[], string> {
        return this.repository.getByCategory(category);
    }
}

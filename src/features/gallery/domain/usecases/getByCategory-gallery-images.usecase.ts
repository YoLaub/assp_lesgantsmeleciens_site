import { ResultAsync } from '@/shared/lib/result';
import { Image } from '../models/image.model';
import { ImageRepository } from '../repositories/image.repository';

export class GetGalleryImagesByCategoryUseCase {
    constructor(private repository: ImageRepository) {}

    execute(categorySlug: string): ResultAsync<Image[], string> {
        return this.repository.getByCategory(categorySlug);
    }
}

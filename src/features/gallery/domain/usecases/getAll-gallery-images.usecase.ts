import { ResultAsync } from '@/shared/lib/result';
import { Image } from '../models/image.model';
import { ImageRepository } from '../repositories/image.repository';

export class GetAllGalleryImagesUseCase {
    constructor(private repository: ImageRepository) {}

    execute(): ResultAsync<Image[], string> {
        return this.repository.getAll();
    }
}

import { GalleryImage } from '../models/gallery-image.model';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class GetAllGalleryImagesUseCase {
    constructor(private repository: GalleryImageRepository) {}

    async execute(): Promise<GalleryImage[]> {
        return await this.repository.getAll();
    }
}

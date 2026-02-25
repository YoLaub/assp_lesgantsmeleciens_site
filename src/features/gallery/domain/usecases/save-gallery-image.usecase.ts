import { GalleryImage } from '../models/gallery-image.model';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class SaveGalleryImageUseCase {
    constructor(private repository: GalleryImageRepository) {}

    async execute(image: GalleryImage): Promise<void> {
        if (!image.title || image.title.length < 2) {
            throw new Error("Le titre de l'image est trop court (minimum 2 caractères).");
        }

        if (!image.src) {
            throw new Error("L'URL de l'image est requise.");
        }

        return await this.repository.save(image);
    }
}

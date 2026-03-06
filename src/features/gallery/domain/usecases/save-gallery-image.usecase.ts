import { ResultAsync, errAsync } from '@/shared/lib/result';
import { GalleryImage } from '../models/gallery-image.model';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class SaveGalleryImageUseCase {
    constructor(private repository: GalleryImageRepository) {}

    execute(image: GalleryImage): ResultAsync<void, string> {
        if (!image.title || image.title.length < 2) {
            return errAsync("Le titre de l'image est trop court (minimum 2 caractères).");
        }

        if (!image.asset?.publicId) {
            return errAsync("Les métadonnées Cloudinary de l'image sont requises.");
        }

        return this.repository.save(image);
    }
}

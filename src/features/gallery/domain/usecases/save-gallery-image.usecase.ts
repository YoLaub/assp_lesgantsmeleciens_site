import { ResultAsync, errAsync } from '@/shared/lib/result';
import { Image } from '../models/image.model';
import { ImageRepository } from '../repositories/image.repository';

export class SaveGalleryImageUseCase {
    constructor(private repository: ImageRepository) {}

    execute(image: Image): ResultAsync<void, string> {
        if (!image.title || image.title.length < 2) {
            return errAsync("Le titre de l'image est trop court (minimum 2 caractères).");
        }

        if (!image.publicId) {
            return errAsync("Les métadonnées Cloudinary de l'image sont requises.");
        }

        return this.repository.save(image);
    }
}

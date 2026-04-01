import { ResultAsync, errAsync } from '@/shared/lib/result';
import { Image } from '../models/image.model';
import { ImageRepository } from '../repositories/image.repository';

export class SaveManyGalleryImagesUseCase {
    constructor(private repository: ImageRepository) {}

    execute(images: Image[]): ResultAsync<void, string> {
        if (images.length === 0) {
            return errAsync('Aucune image à enregistrer.');
        }

        for (const img of images) {
            if (!img.title || img.title.length < 2) {
                return errAsync(`Titre trop court pour "${img.title}" (minimum 2 caractères).`);
            }
            if (!img.publicId) {
                return errAsync(`Métadonnées Cloudinary manquantes pour "${img.title}".`);
            }
        }

        return this.repository.saveMany(images);
    }
}

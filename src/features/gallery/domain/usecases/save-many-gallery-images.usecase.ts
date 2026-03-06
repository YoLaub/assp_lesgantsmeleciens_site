import { ResultAsync, errAsync } from '@/shared/lib/result';
import { GalleryImage } from '../models/gallery-image.model';
import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class SaveManyGalleryImagesUseCase {
    constructor(private repository: GalleryImageRepository) {}

    execute(images: GalleryImage[]): ResultAsync<void, string> {
        if (images.length === 0) {
            return errAsync('Aucune image à enregistrer.');
        }

        for (const img of images) {
            if (!img.title || img.title.length < 2) {
                return errAsync(`Titre trop court pour "${img.title}" (minimum 2 caractères).`);
            }
            if (!img.asset?.publicId) {
                return errAsync(`Métadonnées Cloudinary manquantes pour "${img.title}".`);
            }
        }

        return this.repository.saveMany(images);
    }
}

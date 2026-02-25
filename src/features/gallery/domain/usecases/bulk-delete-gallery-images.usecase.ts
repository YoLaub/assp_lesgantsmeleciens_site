import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class BulkDeleteGalleryImagesUseCase {
    constructor(private repository: GalleryImageRepository) {}

    async execute(ids: string[]): Promise<void> {
        if (!ids.length) {
            throw new Error("Aucune image sélectionnée pour la suppression.");
        }

        return await this.repository.bulkDelete(ids);
    }
}

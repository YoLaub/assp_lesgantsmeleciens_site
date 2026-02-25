import { GalleryImageRepository } from '../repositories/gallery-image.repository';

export class DeleteGalleryImageUseCase {
    constructor(private repository: GalleryImageRepository) {}

    async execute(id: string): Promise<void> {
        return await this.repository.delete(id);
    }
}

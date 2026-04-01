import { ResultAsync } from '@/shared/lib/result';
import { ImageRepository } from '../repositories/image.repository';

export class DeleteGalleryImageUseCase {
    constructor(private repository: ImageRepository) {}

    execute(id: string): ResultAsync<void, string> {
        return this.repository.delete(id);
    }
}

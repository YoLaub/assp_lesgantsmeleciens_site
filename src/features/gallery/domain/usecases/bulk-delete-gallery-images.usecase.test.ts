import { okAsync, errAsync } from '@/shared/lib/result';
import { BulkDeleteGalleryImagesUseCase } from './bulk-delete-gallery-images.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';

describe('BulkDeleteGalleryImagesUseCase', () => {
    it('bulk deletes on success', async () => {
        const repo = createMockRepository();
        repo.bulkDelete.mockReturnValue(okAsync(undefined));

        const useCase = new BulkDeleteGalleryImagesUseCase(repo);
        const result = await useCase.execute(['id-1', 'id-2']);

        expect(result.isOk()).toBe(true);
        expect(repo.bulkDelete).toHaveBeenCalledWith(['id-1', 'id-2']);
    });

    it('rejects empty ids array', async () => {
        const repo = createMockRepository();
        const useCase = new BulkDeleteGalleryImagesUseCase(repo);

        const result = await useCase.execute([]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('Aucune image');
        expect(repo.bulkDelete).not.toHaveBeenCalled();
    });

    it('propagates repository error', async () => {
        const repo = createMockRepository();
        repo.bulkDelete.mockReturnValue(errAsync('Bulk delete failed'));

        const useCase = new BulkDeleteGalleryImagesUseCase(repo);
        const result = await useCase.execute(['id-1']);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Bulk delete failed');
    });
});

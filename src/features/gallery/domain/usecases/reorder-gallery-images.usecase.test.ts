import { okAsync, errAsync } from '@/shared/lib/result';
import { ReorderGalleryImagesUseCase } from './reorder-gallery-images.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';

describe('ReorderGalleryImagesUseCase', () => {
    it('returns ok for empty items (no-op)', async () => {
        const repo = createMockRepository();
        const useCase = new ReorderGalleryImagesUseCase(repo);
        const result = await useCase.execute([]);

        expect(result.isOk()).toBe(true);
        expect(repo.reorderMany).not.toHaveBeenCalled();
    });

    it('delegates to repository.reorderMany', async () => {
        const repo = createMockRepository();
        repo.reorderMany.mockReturnValue(okAsync(undefined));
        const useCase = new ReorderGalleryImagesUseCase(repo);
        const items = [{ id: 'a', order: 0 }, { id: 'b', order: 1 }];
        const result = await useCase.execute(items);

        expect(result.isOk()).toBe(true);
        expect(repo.reorderMany).toHaveBeenCalledWith(items);
    });

    it('propagates repository error', async () => {
        const repo = createMockRepository();
        repo.reorderMany.mockReturnValue(errAsync('Reorder failed'));
        const useCase = new ReorderGalleryImagesUseCase(repo);
        const result = await useCase.execute([{ id: 'a', order: 0 }]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Reorder failed');
    });
});

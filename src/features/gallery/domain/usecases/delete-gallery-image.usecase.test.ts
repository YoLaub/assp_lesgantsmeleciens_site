import { okAsync, errAsync } from '@/shared/lib/result';
import { DeleteGalleryImageUseCase } from './delete-gallery-image.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';

describe('DeleteGalleryImageUseCase', () => {
    it('deletes on success', async () => {
        const repo = createMockRepository();
        repo.delete.mockReturnValue(okAsync(undefined));

        const useCase = new DeleteGalleryImageUseCase(repo);
        const result = await useCase.execute('img-1');

        expect(result.isOk()).toBe(true);
        expect(repo.delete).toHaveBeenCalledWith('img-1');
    });

    it('returns error on failure', async () => {
        const repo = createMockRepository();
        repo.delete.mockReturnValue(errAsync('Delete failed'));

        const useCase = new DeleteGalleryImageUseCase(repo);
        const result = await useCase.execute('img-1');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Delete failed');
    });
});

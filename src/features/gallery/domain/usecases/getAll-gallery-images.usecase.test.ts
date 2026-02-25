import { okAsync, errAsync } from '@/shared/lib/result';
import { GetAllGalleryImagesUseCase } from './getAll-gallery-images.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';
import { makeGalleryImageList } from '../../__tests__/fixtures';

describe('GetAllGalleryImagesUseCase', () => {
    it('returns images on success', async () => {
        const repo = createMockRepository();
        const images = makeGalleryImageList(3);
        repo.getAll.mockReturnValue(okAsync(images));

        const useCase = new GetAllGalleryImagesUseCase(repo);
        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual(images);
    });

    it('returns error on failure', async () => {
        const repo = createMockRepository();
        repo.getAll.mockReturnValue(errAsync('DB error'));

        const useCase = new GetAllGalleryImagesUseCase(repo);
        const result = await useCase.execute();

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('DB error');
    });
});

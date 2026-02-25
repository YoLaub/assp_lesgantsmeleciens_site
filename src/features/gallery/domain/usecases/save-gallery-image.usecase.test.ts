import { okAsync, errAsync } from '@/shared/lib/result';
import { SaveGalleryImageUseCase } from './save-gallery-image.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';
import { makeGalleryImage } from '../../__tests__/fixtures';

describe('SaveGalleryImageUseCase', () => {
    it('saves a valid image', async () => {
        const repo = createMockRepository();
        repo.save.mockReturnValue(okAsync(undefined));

        const useCase = new SaveGalleryImageUseCase(repo);
        const image = makeGalleryImage();
        const result = await useCase.execute(image);

        expect(result.isOk()).toBe(true);
        expect(repo.save).toHaveBeenCalledWith(image);
    });

    it('rejects title shorter than 2 characters', async () => {
        const repo = createMockRepository();
        const useCase = new SaveGalleryImageUseCase(repo);

        const result = await useCase.execute(makeGalleryImage({ title: 'A' }));

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('trop court');
        expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects empty title', async () => {
        const repo = createMockRepository();
        const useCase = new SaveGalleryImageUseCase(repo);

        const result = await useCase.execute(makeGalleryImage({ title: '' }));

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('trop court');
        expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects missing src', async () => {
        const repo = createMockRepository();
        const useCase = new SaveGalleryImageUseCase(repo);

        const result = await useCase.execute(makeGalleryImage({ src: '' }));

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('requise');
        expect(repo.save).not.toHaveBeenCalled();
    });

    it('propagates repository error', async () => {
        const repo = createMockRepository();
        repo.save.mockReturnValue(errAsync('Save failed'));

        const useCase = new SaveGalleryImageUseCase(repo);
        const result = await useCase.execute(makeGalleryImage());

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Save failed');
    });
});

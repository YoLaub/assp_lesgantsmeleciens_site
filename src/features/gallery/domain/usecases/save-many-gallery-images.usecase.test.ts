import { okAsync, errAsync } from '@/shared/lib/result';
import { SaveManyGalleryImagesUseCase } from './save-many-gallery-images.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';
import { makeGalleryImage } from '../../__tests__/fixtures';

describe('SaveManyGalleryImagesUseCase', () => {
    it('rejects empty array', async () => {
        const repo = createMockRepository();
        const useCase = new SaveManyGalleryImagesUseCase(repo);
        const result = await useCase.execute([]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('Aucune image');
        expect(repo.saveMany).not.toHaveBeenCalled();
    });

    it('rejects image with title too short', async () => {
        const repo = createMockRepository();
        const useCase = new SaveManyGalleryImagesUseCase(repo);
        const result = await useCase.execute([makeGalleryImage({ title: 'A' })]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('Titre trop court');
        expect(repo.saveMany).not.toHaveBeenCalled();
    });

    it('rejects image with missing src', async () => {
        const repo = createMockRepository();
        const useCase = new SaveManyGalleryImagesUseCase(repo);
        const result = await useCase.execute([makeGalleryImage({ src: '' })]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toContain('URL manquante');
        expect(repo.saveMany).not.toHaveBeenCalled();
    });

    it('saves valid images', async () => {
        const repo = createMockRepository();
        repo.saveMany.mockReturnValue(okAsync(undefined));
        const useCase = new SaveManyGalleryImagesUseCase(repo);
        const images = [makeGalleryImage({ id: 'a' }), makeGalleryImage({ id: 'b' })];
        const result = await useCase.execute(images);

        expect(result.isOk()).toBe(true);
        expect(repo.saveMany).toHaveBeenCalledWith(images);
    });

    it('propagates repository error', async () => {
        const repo = createMockRepository();
        repo.saveMany.mockReturnValue(errAsync('DB write error'));
        const useCase = new SaveManyGalleryImagesUseCase(repo);
        const result = await useCase.execute([makeGalleryImage()]);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('DB write error');
    });
});

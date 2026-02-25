import { vi } from 'vitest';
import { okAsync } from '@/shared/lib/result';
import { makeGalleryImage, makeGalleryImageList } from '../../__tests__/fixtures';

const mockDataSource = vi.hoisted(() => ({
    getGalleryImages: vi.fn(),
    getGalleryImageById: vi.fn(),
    upsertGalleryImage: vi.fn(),
    deleteGalleryImage: vi.fn(),
    bulkDeleteGalleryImages: vi.fn(),
}));

vi.mock('../datasources/gallery-image.postgres.datasource', () => ({
    GalleryImagePostgresDataSource: class {
        getGalleryImages = mockDataSource.getGalleryImages;
        getGalleryImageById = mockDataSource.getGalleryImageById;
        upsertGalleryImage = mockDataSource.upsertGalleryImage;
        deleteGalleryImage = mockDataSource.deleteGalleryImage;
        bulkDeleteGalleryImages = mockDataSource.bulkDeleteGalleryImages;
    },
}));

import { GalleryImageRepositoryImpl } from './gallery-image.repository.impl';

describe('GalleryImageRepositoryImpl', () => {
    let repo: GalleryImageRepositoryImpl;

    beforeEach(() => {
        repo = new GalleryImageRepositoryImpl();
    });

    it('getAll delegates to datasource.getGalleryImages', async () => {
        const images = makeGalleryImageList(2);
        mockDataSource.getGalleryImages.mockReturnValue(okAsync(images));

        const result = await repo.getAll();

        expect(result._unsafeUnwrap()).toEqual(images);
        expect(mockDataSource.getGalleryImages).toHaveBeenCalled();
    });

    it('getById delegates to datasource.getGalleryImageById', async () => {
        const image = makeGalleryImage();
        mockDataSource.getGalleryImageById.mockReturnValue(okAsync(image));

        const result = await repo.getById('img-1');

        expect(result._unsafeUnwrap()).toEqual(image);
        expect(mockDataSource.getGalleryImageById).toHaveBeenCalledWith('img-1');
    });

    it('save delegates to datasource.upsertGalleryImage', async () => {
        mockDataSource.upsertGalleryImage.mockReturnValue(okAsync(undefined));
        const image = makeGalleryImage();

        await repo.save(image);

        expect(mockDataSource.upsertGalleryImage).toHaveBeenCalledWith(image);
    });

    it('delete delegates to datasource.deleteGalleryImage', async () => {
        mockDataSource.deleteGalleryImage.mockReturnValue(okAsync(undefined));

        await repo.delete('img-1');

        expect(mockDataSource.deleteGalleryImage).toHaveBeenCalledWith('img-1');
    });

    it('bulkDelete delegates to datasource.bulkDeleteGalleryImages', async () => {
        mockDataSource.bulkDeleteGalleryImages.mockReturnValue(okAsync(undefined));

        await repo.bulkDelete(['id-1', 'id-2']);

        expect(mockDataSource.bulkDeleteGalleryImages).toHaveBeenCalledWith(['id-1', 'id-2']);
    });
});

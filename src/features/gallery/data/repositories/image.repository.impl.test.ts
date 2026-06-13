import { vi } from 'vitest';
import { okAsync, errAsync } from '@/shared/lib/result';
import { makeGalleryImage, makeGalleryImageList } from '../../__tests__/fixtures';

const mockDataSource = vi.hoisted(() => ({
    getImages: vi.fn(),
    getImagesByCategory: vi.fn(),
    getImageById: vi.fn(),
    getImagesByIds: vi.fn(),
    upsertImage: vi.fn(),
    createManyImages: vi.fn(),
    deleteImage: vi.fn(),
    bulkDeleteImages: vi.fn(),
    reorderImages: vi.fn(),
}));

vi.mock('../datasources/image.postgres.datasource', () => ({
    ImagePostgresDataSource: class {
        getImages = mockDataSource.getImages;
        getImagesByCategory = mockDataSource.getImagesByCategory;
        getImageById = mockDataSource.getImageById;
        getImagesByIds = mockDataSource.getImagesByIds;
        upsertImage = mockDataSource.upsertImage;
        createManyImages = mockDataSource.createManyImages;
        deleteImage = mockDataSource.deleteImage;
        bulkDeleteImages = mockDataSource.bulkDeleteImages;
        reorderImages = mockDataSource.reorderImages;
    },
}));

import { ImageRepositoryImpl } from './image.repository.impl';

describe('ImageRepositoryImpl', () => {
    let repo: ImageRepositoryImpl;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new ImageRepositoryImpl();
    });

    it('getAll delegates to datasource.getImages', async () => {
        const images = makeGalleryImageList(2);
        mockDataSource.getImages.mockReturnValue(okAsync(images));

        const result = await repo.getAll();

        expect(result._unsafeUnwrap()).toEqual(images);
        expect(mockDataSource.getImages).toHaveBeenCalled();
    });

    it('getByCategory delegates to datasource.getImagesByCategory', async () => {
        const images = makeGalleryImageList(2);
        mockDataSource.getImagesByCategory.mockReturnValue(okAsync(images));

        const result = await repo.getByCategory('discipline');

        expect(result._unsafeUnwrap()).toEqual(images);
        expect(mockDataSource.getImagesByCategory).toHaveBeenCalledWith('discipline');
    });

    it('getById delegates to datasource.getImageById', async () => {
        const image = makeGalleryImage();
        mockDataSource.getImageById.mockReturnValue(okAsync(image));

        const result = await repo.getById('img-1');

        expect(result._unsafeUnwrap()).toEqual(image);
        expect(mockDataSource.getImageById).toHaveBeenCalledWith('img-1');
    });

    it('getByIds delegates to datasource.getImagesByIds', async () => {
        const images = makeGalleryImageList(2);
        mockDataSource.getImagesByIds.mockReturnValue(okAsync(images));

        const result = await repo.getByIds(['img-1', 'img-2']);

        expect(result._unsafeUnwrap()).toEqual(images);
        expect(mockDataSource.getImagesByIds).toHaveBeenCalledWith(['img-1', 'img-2']);
    });

    it('save delegates to datasource.upsertImage', async () => {
        mockDataSource.upsertImage.mockReturnValue(okAsync(undefined));
        const image = makeGalleryImage();

        await repo.save(image);

        expect(mockDataSource.upsertImage).toHaveBeenCalledWith(image);
    });

    it('saveMany delegates to datasource.createManyImages', async () => {
        mockDataSource.createManyImages.mockReturnValue(okAsync(undefined));
        const images = makeGalleryImageList(2);

        await repo.saveMany(images);

        expect(mockDataSource.createManyImages).toHaveBeenCalledWith(images);
    });

    it('delete delegates to datasource.deleteImage', async () => {
        mockDataSource.deleteImage.mockReturnValue(okAsync(undefined));

        await repo.delete('img-1');

        expect(mockDataSource.deleteImage).toHaveBeenCalledWith('img-1');
    });

    it('bulkDelete delegates to datasource.bulkDeleteImages', async () => {
        mockDataSource.bulkDeleteImages.mockReturnValue(okAsync(undefined));

        await repo.bulkDelete(['id-1', 'id-2']);

        expect(mockDataSource.bulkDeleteImages).toHaveBeenCalledWith(['id-1', 'id-2']);
    });

    it('reorderMany delegates to datasource.reorderImages', async () => {
        mockDataSource.reorderImages.mockReturnValue(okAsync(undefined));
        const items = [{ id: 'img-1', order: 1 }];

        await repo.reorderMany(items);

        expect(mockDataSource.reorderImages).toHaveBeenCalledWith(items);
    });
});

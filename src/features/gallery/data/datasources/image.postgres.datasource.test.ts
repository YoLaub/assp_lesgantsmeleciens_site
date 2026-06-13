import { vi } from 'vitest';
import { makeGalleryImage, makeGalleryImageList } from '../../__tests__/fixtures';

const mockPrismaImage = vi.hoisted(() => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    createMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    update: vi.fn(),
}));

const mockTransaction = vi.fn();

vi.mock('@/shared/lib/prisma', () => ({
    prisma: {
        image: mockPrismaImage,
        $transaction: (...args: any[]) => mockTransaction(...args),
    },
}));

import { ImagePostgresDataSource } from './image.postgres.datasource';

describe('ImagePostgresDataSource', () => {
    let ds: ImagePostgresDataSource;

    beforeEach(() => {
        vi.clearAllMocks();
        ds = new ImagePostgresDataSource();
    });

    describe('getImages', () => {
        it('returns mapped images ordered by order ASC', async () => {
            const dbImages = makeGalleryImageList(2);
            mockPrismaImage.findMany.mockResolvedValue(dbImages);

            const result = await ds.getImages();

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual(dbImages);
            expect(mockPrismaImage.findMany).toHaveBeenCalledWith({
                orderBy: { order: 'asc' },
                include: { category: true },
            });
        });

        it('returns Err on Prisma throw', async () => {
            mockPrismaImage.findMany.mockRejectedValue(new Error('DB down'));

            const result = await ds.getImages();

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain('récupération des images');
        });
    });

    describe('getImagesByCategory', () => {
        it('returns images matching the category slug', async () => {
            const dbImages = makeGalleryImageList(2);
            mockPrismaImage.findMany.mockResolvedValue(dbImages);

            const result = await ds.getImagesByCategory('discipline');

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual(dbImages);
            expect(mockPrismaImage.findMany).toHaveBeenCalledWith({
                where: { category: { slug: 'discipline' } },
                orderBy: { order: 'asc' },
                include: { category: true },
            });
        });

        it('returns Err on Prisma throw', async () => {
            mockPrismaImage.findMany.mockRejectedValue(new Error('DB down'));

            const result = await ds.getImagesByCategory('discipline');

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain('récupération des images par catégorie');
        });
    });

    describe('getImageById', () => {
        it('returns image when found', async () => {
            const image = makeGalleryImage();
            mockPrismaImage.findUnique.mockResolvedValue(image);

            const result = await ds.getImageById('img-1');

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual(image);
            expect(mockPrismaImage.findUnique).toHaveBeenCalledWith({
                where: { id: 'img-1' },
                include: { category: true },
            });
        });

        it('returns null when not found', async () => {
            mockPrismaImage.findUnique.mockResolvedValue(null);

            const result = await ds.getImageById('nonexistent');

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toBeNull();
        });

        it('returns Err on throw', async () => {
            mockPrismaImage.findUnique.mockRejectedValue(new Error('DB down'));

            const result = await ds.getImageById('img-1');

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain("récupération de l'image");
        });
    });

    describe('getImagesByIds', () => {
        it('returns images matching the ids list', async () => {
            const dbImages = makeGalleryImageList(2);
            mockPrismaImage.findMany.mockResolvedValue(dbImages);

            const result = await ds.getImagesByIds(['id-1', 'id-2']);

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual(dbImages);
            expect(mockPrismaImage.findMany).toHaveBeenCalledWith({
                where: { id: { in: ['id-1', 'id-2'] } },
                include: { category: true },
            });
        });
    });

    describe('upsertImage', () => {
        it('upserts successfully', async () => {
            mockPrismaImage.upsert.mockResolvedValue({});
            const image = makeGalleryImage();

            const result = await ds.upsertImage(image);

            expect(result.isOk()).toBe(true);
        });

        it('passes correct where/update/create args', async () => {
            mockPrismaImage.upsert.mockResolvedValue({});
            const image = makeGalleryImage({ id: 'my-id' });

            await ds.upsertImage(image);

            expect(mockPrismaImage.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'my-id' },
                    update: expect.objectContaining({ title: image.title }),
                    create: expect.objectContaining({ title: image.title, publicId: image.publicId }),
                }),
            );
        });

        it('returns Err on throw', async () => {
            mockPrismaImage.upsert.mockRejectedValue(new Error('DB error'));

            const result = await ds.upsertImage(makeGalleryImage());

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain("sauvegarde");
        });
    });

    describe('createManyImages', () => {
        it('saves multiple images successfully', async () => {
            mockPrismaImage.createMany.mockResolvedValue({ count: 2 });
            const images = makeGalleryImageList(2);

            const result = await ds.createManyImages(images);

            expect(result.isOk()).toBe(true);
            expect(mockPrismaImage.createMany).toHaveBeenCalledWith({
                data: expect.any(Array),
            });
        });
    });

    describe('deleteImage', () => {
        it('deletes successfully', async () => {
            mockPrismaImage.delete.mockResolvedValue({});

            const result = await ds.deleteImage('img-1');

            expect(result.isOk()).toBe(true);
            expect(mockPrismaImage.delete).toHaveBeenCalledWith({
                where: { id: 'img-1' },
            });
        });

        it('returns Err on throw', async () => {
            mockPrismaImage.delete.mockRejectedValue(new Error('DB error'));

            const result = await ds.deleteImage('img-1');

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain("suppression de l'image");
        });
    });

    describe('bulkDeleteImages', () => {
        it('deletes multiple images', async () => {
            mockPrismaImage.deleteMany.mockResolvedValue({ count: 2 });

            const result = await ds.bulkDeleteImages(['id-1', 'id-2']);

            expect(result.isOk()).toBe(true);
        });

        it('passes { in: ids } where clause', async () => {
            mockPrismaImage.deleteMany.mockResolvedValue({ count: 2 });

            await ds.bulkDeleteImages(['id-1', 'id-2']);

            expect(mockPrismaImage.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: ['id-1', 'id-2'] } },
            });
        });

        it('returns Err on throw', async () => {
            mockPrismaImage.deleteMany.mockRejectedValue(new Error('DB error'));

            const result = await ds.bulkDeleteImages(['id-1']);

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain('suppression des images');
        });
    });

    describe('reorderImages', () => {
        it('reorders successfully inside transaction', async () => {
            mockTransaction.mockResolvedValue([{}, {}]);
            const items = [{ id: 'id-1', order: 1 }, { id: 'id-2', order: 2 }];

            const result = await ds.reorderImages(items);

            expect(result.isOk()).toBe(true);
            expect(mockTransaction).toHaveBeenCalled();
        });
    });
});

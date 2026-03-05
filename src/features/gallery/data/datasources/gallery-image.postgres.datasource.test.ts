import { vi } from 'vitest';
import { makeGalleryImage, makeGalleryImageList } from '../../__tests__/fixtures';

const mockPrismaGalleryImage = vi.hoisted(() => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
}));

vi.mock('@/shared/lib/prisma', () => ({
    prisma: {
        galleryImage: mockPrismaGalleryImage,
    },
}));

import { GalleryImagePostgresDataSource } from './gallery-image.postgres.datasource';

describe('GalleryImagePostgresDataSource', () => {
    let ds: GalleryImagePostgresDataSource;

    beforeEach(() => {
        ds = new GalleryImagePostgresDataSource();
    });

    describe('getGalleryImages', () => {
        it('returns mapped images ordered by order ASC', async () => {
            const dbImages = makeGalleryImageList(2);
            mockPrismaGalleryImage.findMany.mockResolvedValue(dbImages);

            const result = await ds.getGalleryImages();

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual(dbImages);
            expect(mockPrismaGalleryImage.findMany).toHaveBeenCalledWith({
                orderBy: { order: 'asc' },
            });
        });

        it('returns Err on Prisma throw', async () => {
            mockPrismaGalleryImage.findMany.mockRejectedValue(new Error('DB down'));

            const result = await ds.getGalleryImages();

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain('récupération des images');
        });
    });

    describe('getGalleryImageById', () => {
        it('returns image when found', async () => {
            const image = makeGalleryImage();
            mockPrismaGalleryImage.findUnique.mockResolvedValue(image);

            const result = await ds.getGalleryImageById('img-1');

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toEqual(image);
            expect(mockPrismaGalleryImage.findUnique).toHaveBeenCalledWith({
                where: { id: 'img-1' },
            });
        });

        it('returns null when not found', async () => {
            mockPrismaGalleryImage.findUnique.mockResolvedValue(null);

            const result = await ds.getGalleryImageById('nonexistent');

            expect(result.isOk()).toBe(true);
            expect(result._unsafeUnwrap()).toBeNull();
        });

        it('returns Err on throw', async () => {
            mockPrismaGalleryImage.findUnique.mockRejectedValue(new Error('DB down'));

            const result = await ds.getGalleryImageById('img-1');

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain("récupération de l'image");
        });
    });

    describe('upsertGalleryImage', () => {
        it('upserts successfully', async () => {
            mockPrismaGalleryImage.upsert.mockResolvedValue({});
            const image = makeGalleryImage();

            const result = await ds.upsertGalleryImage(image);

            expect(result.isOk()).toBe(true);
        });

        it('passes correct where/update/create args', async () => {
            mockPrismaGalleryImage.upsert.mockResolvedValue({});
            const image = makeGalleryImage({ id: 'my-id' });

            await ds.upsertGalleryImage(image);

            expect(mockPrismaGalleryImage.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'my-id' },
                    update: expect.objectContaining({ title: image.title }),
                    create: expect.objectContaining({ title: image.title, src: image.src }),
                }),
            );
        });

        it('returns Err on throw', async () => {
            mockPrismaGalleryImage.upsert.mockRejectedValue(new Error('DB error'));

            const result = await ds.upsertGalleryImage(makeGalleryImage());

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain("sauvegarde");
        });
    });

    describe('deleteGalleryImage', () => {
        it('deletes successfully', async () => {
            mockPrismaGalleryImage.delete.mockResolvedValue({});

            const result = await ds.deleteGalleryImage('img-1');

            expect(result.isOk()).toBe(true);
            expect(mockPrismaGalleryImage.delete).toHaveBeenCalledWith({
                where: { id: 'img-1' },
            });
        });

        it('returns Err on throw', async () => {
            mockPrismaGalleryImage.delete.mockRejectedValue(new Error('DB error'));

            const result = await ds.deleteGalleryImage('img-1');

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain("suppression de l'image");
        });
    });

    describe('bulkDeleteGalleryImages', () => {
        it('deletes multiple images', async () => {
            mockPrismaGalleryImage.deleteMany.mockResolvedValue({ count: 2 });

            const result = await ds.bulkDeleteGalleryImages(['id-1', 'id-2']);

            expect(result.isOk()).toBe(true);
        });

        it('passes { in: ids } where clause', async () => {
            mockPrismaGalleryImage.deleteMany.mockResolvedValue({ count: 2 });

            await ds.bulkDeleteGalleryImages(['id-1', 'id-2']);

            expect(mockPrismaGalleryImage.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: ['id-1', 'id-2'] } },
            });
        });

        it('returns Err on throw', async () => {
            mockPrismaGalleryImage.deleteMany.mockRejectedValue(new Error('DB error'));

            const result = await ds.bulkDeleteGalleryImages(['id-1']);

            expect(result.isErr()).toBe(true);
            expect(result._unsafeUnwrapErr()).toContain('suppression des images');
        });
    });
});

// @vitest-environment node
import { vi } from 'vitest';
import { makeGalleryImage, makeGalleryImageList } from '@/features/gallery/__tests__/fixtures';

// --- Hoisted mocks ---

const mockDataSource = vi.hoisted(() => ({
    getGalleryImages: vi.fn(),
    getGalleryImageById: vi.fn(),
    upsertGalleryImage: vi.fn(),
    deleteGalleryImage: vi.fn(),
    bulkDeleteGalleryImages: vi.fn(),
}));

const mockRevalidatePath = vi.hoisted(() => vi.fn());
const mockUploadPublicImage = vi.hoisted(() => vi.fn());

const mockPrismaImageCategory = vi.hoisted(() => ({
    upsert: vi.fn(),
}));

vi.mock('@/features/gallery/data/repositories/image.repository.impl', () => ({
    ImageRepositoryImpl: class {
        private dataSource = mockDataSource;
        getAll() { return mockDataSource.getGalleryImages(); }
        getByCategory(categorySlug: string) { return mockDataSource.getGalleryImages(); }
        getById(id: string) { return mockDataSource.getGalleryImageById(id); }
        save(image: unknown) { return mockDataSource.upsertGalleryImage(image); }
        delete(id: string) { return mockDataSource.deleteGalleryImage(id); }
        bulkDelete(ids: string[]) { return mockDataSource.bulkDeleteGalleryImages(ids); }
    },
}));

vi.mock('@/shared/lib/prisma', () => ({
    prisma: {
        imageCategory: mockPrismaImageCategory,
    },
}));

vi.mock('@/shared/lib/cloudinary.server', () => ({
    deleteCloudinaryAsset: vi.fn(),
    deleteCloudinaryAssets: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: mockRevalidatePath,
}));

vi.mock('@/shared/lib/upload', () => ({
    uploadPublicImage: mockUploadPublicImage,
}));

import { okAsync, errAsync } from '@/shared/lib/result';
import {
    getAllGalleryImagesAction,
    saveGalleryImageAction,
    deleteGalleryImageAction,
    bulkDeleteGalleryImagesAction,
    uploadGalleryImageAction,
} from './gallery.actions';

describe('gallery server actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPrismaImageCategory.upsert.mockResolvedValue({
            id: 'cat-1',
            name: 'Discipline',
            slug: 'discipline',
        });
        mockDataSource.getGalleryImages.mockReturnValue(okAsync([]));
        mockDataSource.getGalleryImageById.mockReturnValue(okAsync(null));
        mockDataSource.upsertGalleryImage.mockReturnValue(okAsync(undefined));
        mockDataSource.deleteGalleryImage.mockReturnValue(okAsync(undefined));
        mockDataSource.bulkDeleteGalleryImages.mockReturnValue(okAsync(undefined));
    });

    describe('getAllGalleryImagesAction', () => {
        it('returns { success: true, images } on success', async () => {
            const images = makeGalleryImageList(2);
            mockDataSource.getGalleryImages.mockReturnValue(okAsync(images));

            const result = await getAllGalleryImagesAction();

            expect(result).toEqual({ success: true, images });
        });

        it('returns { success: false, error } on failure', async () => {
            mockDataSource.getGalleryImages.mockReturnValue(errAsync('DB error'));

            const result = await getAllGalleryImagesAction();

            expect(result).toEqual({ success: false, error: 'DB error' });
        });
    });

    describe('saveGalleryImageAction', () => {
        it('returns success and calls revalidatePath', async () => {
            mockDataSource.upsertGalleryImage.mockReturnValue(okAsync(undefined));
            const image = makeGalleryImage();

            const result = await saveGalleryImageAction(image);

            expect(result).toEqual({ success: true });
            expect(mockRevalidatePath).toHaveBeenCalledWith('/content/gallery');
        });

        it('returns error, no revalidation', async () => {
            const image = makeGalleryImage({ title: 'A' }); // too short

            const result = await saveGalleryImageAction(image);

            expect(result.success).toBe(false);
            expect(mockRevalidatePath).not.toHaveBeenCalled();
        });
    });

    describe('deleteGalleryImageAction', () => {
        it('returns success and revalidates', async () => {
            mockDataSource.getGalleryImageById.mockReturnValue(okAsync(makeGalleryImage()));
            mockDataSource.deleteGalleryImage.mockReturnValue(okAsync(undefined));

            const result = await deleteGalleryImageAction('img-1');

            expect(result).toEqual({ success: true });
            expect(mockRevalidatePath).toHaveBeenCalledWith('/content/gallery');
        });

        it('returns error', async () => {
            mockDataSource.getGalleryImageById.mockReturnValue(okAsync(makeGalleryImage()));
            mockDataSource.deleteGalleryImage.mockReturnValue(errAsync('Not found'));

            const result = await deleteGalleryImageAction('img-1');

            expect(result).toEqual({ success: false, error: 'Not found' });
        });
    });

    describe('bulkDeleteGalleryImagesAction', () => {
        it('returns success and revalidates', async () => {
            mockDataSource.getGalleryImages.mockReturnValue(okAsync(makeGalleryImageList(2)));
            mockDataSource.bulkDeleteGalleryImages.mockReturnValue(okAsync(undefined));

            const result = await bulkDeleteGalleryImagesAction(['id-1', 'id-2']);

            expect(result).toEqual({ success: true });
            expect(mockRevalidatePath).toHaveBeenCalledWith('/content/gallery');
        });

        it('returns error for empty ids', async () => {
            const result = await bulkDeleteGalleryImagesAction([]);

            expect(result.success).toBe(false);
            expect(mockRevalidatePath).not.toHaveBeenCalled();
        });

        it('returns error on repo fail', async () => {
            mockDataSource.getGalleryImages.mockReturnValue(okAsync(makeGalleryImageList(2)));
            mockDataSource.bulkDeleteGalleryImages.mockReturnValue(errAsync('Bulk failed'));

            const result = await bulkDeleteGalleryImagesAction(['id-1']);

            expect(result).toEqual({ success: false, error: 'Bulk failed' });
        });
    });

    describe('uploadGalleryImageAction', () => {
        function makeFile(
            name = 'photo.jpg',
            type = 'image/jpeg',
            sizeBytes = 1024,
        ): File {
            const buffer = new ArrayBuffer(sizeBytes);
            return new File([buffer], name, { type });
        }

        function makeFormDataWith(file: File, categoryId = 'discipline'): FormData {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('categoryId', categoryId);
            return fd;
        }

        beforeEach(() => {
            mockUploadPublicImage.mockResolvedValue({
                url: 'https://res.cloudinary.com/test/gallery/photo.jpg',
                width: 1920,
                height: 1080,
                blurDataUrl: 'data:image/svg+xml;base64,xxx',
            });
        });

        it('uploads valid JPEG and returns url', async () => {
            const file = makeFile();
            const fd = makeFormDataWith(file);

            const result = await uploadGalleryImageAction(fd);

            expect(result).toEqual({
                success: true,
                asset: {
                    url: 'https://res.cloudinary.com/test/gallery/photo.jpg',
                    width: 1920,
                    height: 1080,
                },
                blurDataUrl: 'data:image/svg+xml;base64,xxx',
                categoryId: 'cat-1',
                categorySlug: 'discipline',
                categoryName: 'Discipline',
            });
            expect(mockUploadPublicImage).toHaveBeenCalledWith(expect.any(File), 'gallery');
        });

        it('rejects missing file', async () => {
            const fd = new FormData();
            fd.append('categoryId', 'discipline');

            const result = await uploadGalleryImageAction(fd);

            expect(result).toEqual({ success: false, error: 'Aucun fichier fourni' });
        });

        it('rejects file > 5MB', async () => {
            const fd = makeFormDataWith(makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024));

            const result = await uploadGalleryImageAction(fd);

            expect(result).toEqual({
                success: false,
                error: 'Fichier trop volumineux (max 5 Mo)',
            });
        });

        it('rejects invalid type (gif)', async () => {
            const fd = makeFormDataWith(makeFile('anim.gif', 'image/gif'));

            const result = await uploadGalleryImageAction(fd);

            expect(result.success).toBe(false);
            expect((result as { error: string }).error).toContain('Type de fichier invalide');
        });

        it('accepts jpeg, png, webp', async () => {
            for (const [name, type] of [
                ['photo.jpeg', 'image/jpeg'],
                ['photo.png', 'image/png'],
                ['photo.webp', 'image/webp'],
            ]) {
                const fd = makeFormDataWith(makeFile(name, type));

                const result = await uploadGalleryImageAction(fd);

                expect(result.success).toBe(true);
            }
        });

        it('returns error on upload failure', async () => {
            mockUploadPublicImage.mockRejectedValue(new Error('Upload error'));
            const fd = makeFormDataWith(makeFile());

            const result = await uploadGalleryImageAction(fd);

            expect(result.success).toBe(false);
            expect((result as { error: string }).error).toBe('Upload error');
        });

        it('rejects unknown category slug (not in IMAGE_CATEGORIES)', async () => {
            const fd = makeFormDataWith(makeFile(), 'unknown-slug');

            const result = await uploadGalleryImageAction(fd);

            expect(result).toEqual({ success: false, error: 'Catégorie inconnue : unknown-slug' });
            expect(mockPrismaImageCategory.upsert).not.toHaveBeenCalled();
        });
    });
});

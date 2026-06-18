'use server';

import { ImageRepositoryImpl } from '@/features/gallery/data/repositories/image.repository.impl';
import { SaveGalleryImageUseCase } from '@/features/gallery/domain/usecases/save-gallery-image.usecase';
import { GetAllGalleryImagesUseCase } from '@/features/gallery/domain/usecases/getAll-gallery-images.usecase';
import { DeleteGalleryImageUseCase } from '@/features/gallery/domain/usecases/delete-gallery-image.usecase';
import { BulkDeleteGalleryImagesUseCase } from '@/features/gallery/domain/usecases/bulk-delete-gallery-images.usecase';
import { SaveManyGalleryImagesUseCase } from '@/features/gallery/domain/usecases/save-many-gallery-images.usecase';
import { ReorderGalleryImagesUseCase } from '@/features/gallery/domain/usecases/reorder-gallery-images.usecase';
import { GetGalleryImagesByCategoryUseCase } from '@/features/gallery/domain/usecases/getByCategory-gallery-images.usecase';
import { Image } from '@/features/gallery/domain/models/image.model';
import { IMAGE_CATEGORIES } from '@/features/gallery/domain/models/gallery-category.model';
import { revalidatePath } from 'next/cache';
import { ResultAsync } from '@/shared/lib/result';
import { uploadPublicImage } from '@/shared/lib/upload';
import { deleteCloudinaryAsset, deleteCloudinaryAssets } from '@/shared/lib/cloudinary.server';

function toCloudinaryAsset(image: Image) {
    return {
        publicId: image.publicId,
        version: image.version,
        format: image.format,
        width: image.width,
        height: image.height,
        bytes: image.bytes,
        resourceType: 'image' as const,
    };
}

export async function getAllGalleryImagesAction() {
    const repository = new ImageRepositoryImpl();
    const useCase = new GetAllGalleryImagesUseCase(repository);

    return useCase.execute().match(
        (images) => ({ success: true as const, images }),
        (error) => ({ success: false as const, error })
    );
}

export async function getGalleryImagesByCategoryAction(categorySlug: string) {
    const repository = new ImageRepositoryImpl();
    const useCase = new GetGalleryImagesByCategoryUseCase(repository);

    return useCase.execute(categorySlug).match(
        (images) => ({ success: true as const, images }),
        (error) => ({ success: false as const, error })
    );
}

export async function saveGalleryImageAction(data: Image) {
    const repository = new ImageRepositoryImpl();
    const useCase = new SaveGalleryImageUseCase(repository);

    return useCase.execute(data).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );
}

export async function deleteGalleryImageAction(id: string) {
    const repository = new ImageRepositoryImpl();

    // Fetch image first for Cloudinary cleanup
    const image = await repository.getById(id).match(
        (img) => img,
        () => null
    );

    const useCase = new DeleteGalleryImageUseCase(repository);
    const result = await useCase.execute(id).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );

    // Clean up Cloudinary (best effort)
    if (result.success && image) {
        try {
            await deleteCloudinaryAsset(toCloudinaryAsset(image));
        } catch (e) {
            console.error('Cloudinary cleanup failed:', e);
        }
    }

    return result;
}

export async function bulkDeleteGalleryImagesAction(ids: string[]) {
    const repository = new ImageRepositoryImpl();

    // Fetch images first for Cloudinary cleanup
    const images = await repository.getAll().match(
        (allImages) => allImages.filter(img => ids.includes(img.id)),
        () => [] as Image[]
    );

    const useCase = new BulkDeleteGalleryImagesUseCase(repository);
    const result = await useCase.execute(ids).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );

    // Clean up Cloudinary (best effort)
    if (result.success && images.length > 0) {
        try {
            const assets = images.map(toCloudinaryAsset);
            await deleteCloudinaryAssets(assets);
        } catch (e) {
            console.error('Cloudinary cleanup failed:', e);
        }
    }

    return result;
}

export async function bulkSaveGalleryImagesAction(images: Image[]) {
    const repository = new ImageRepositoryImpl();
    const useCase = new SaveManyGalleryImagesUseCase(repository);

    return useCase.execute(images).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );
}

export async function uploadGalleryImageAction(formData: FormData) {
    const file = formData.get('file') as File;
    const categorySlug = formData.get('categoryId') as string;

    if (!file) {
        return { success: false as const, error: 'Aucun fichier fourni' };
    }

    if (!categorySlug) {
        return { success: false as const, error: 'Catégorie requise' };
    }

    // Validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { success: false as const, error: 'Fichier trop volumineux (max 5 Mo)' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false as const, error: 'Type de fichier invalide. Utilisez JPG, PNG ou WebP' };
    }

    // Validate slug against the model (source of truth), then upsert in DB
    const catDef = IMAGE_CATEGORIES.find((c) => c.slug === categorySlug);
    if (!catDef) {
        return { success: false as const, error: `Catégorie inconnue : ${categorySlug}` };
    }
    const { prisma } = await import('@/shared/lib/prisma');
    const category = await prisma.imageCategory.upsert({
        where: { slug: categorySlug },
        create: { name: catDef.name, slug: catDef.slug },
        update: {},
    });

    return ResultAsync.fromPromise(
        uploadPublicImage(file, 'gallery'),
        (error: unknown) => {
            console.error('Cloudinary Upload Error:', error);
            return error instanceof Error ? error.message : "Erreur lors de l'upload sur le cloud";
        }
    ).match(
        ({ blurDataUrl, ...asset }) => ({
            success: true as const,
            asset,
            blurDataUrl,
            categoryId: category.id,
            categorySlug: category.slug,
            categoryName: category.name,
        }),
        (error) => ({ success: false as const, error })
    );
}

export async function reorderGalleryImagesAction(items: { id: string; order: number }[]) {
    const repository = new ImageRepositoryImpl();
    const useCase = new ReorderGalleryImagesUseCase(repository);

    return useCase.execute(items).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );
}

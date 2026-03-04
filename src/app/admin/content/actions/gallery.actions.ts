'use server';

import { GalleryImageRepositoryImpl } from '@/features/gallery/data/repositories/gallery-image.repository.impl';
import { SaveGalleryImageUseCase } from '@/features/gallery/domain/usecases/save-gallery-image.usecase';
import { GetAllGalleryImagesUseCase } from '@/features/gallery/domain/usecases/getAll-gallery-images.usecase';
import { DeleteGalleryImageUseCase } from '@/features/gallery/domain/usecases/delete-gallery-image.usecase';
import { BulkDeleteGalleryImagesUseCase } from '@/features/gallery/domain/usecases/bulk-delete-gallery-images.usecase';
import { SaveManyGalleryImagesUseCase } from '@/features/gallery/domain/usecases/save-many-gallery-images.usecase';
import { ReorderGalleryImagesUseCase } from '@/features/gallery/domain/usecases/reorder-gallery-images.usecase';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { revalidatePath } from 'next/cache';
import { ResultAsync } from '@/shared/lib/result';
import { uploadPublicImage } from '@/shared/lib/upload';

export async function getAllGalleryImagesAction() {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new GetAllGalleryImagesUseCase(repository);

    return useCase.execute().match(
        (images) => ({ success: true as const, images }),
        (error) => ({ success: false as const, error })
    );
}

export async function saveGalleryImageAction(data: GalleryImage) {
    const repository = new GalleryImageRepositoryImpl();
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
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new DeleteGalleryImageUseCase(repository);

    return useCase.execute(id).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );
}

export async function bulkDeleteGalleryImagesAction(ids: string[]) {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new BulkDeleteGalleryImagesUseCase(repository);

    return useCase.execute(ids).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );
}

export async function bulkSaveGalleryImagesAction(images: GalleryImage[]) {
    const repository = new GalleryImageRepositoryImpl();
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

    if (!file) {
        return { success: false as const, error: 'Aucun fichier fourni' };
    }

    // 1. Validation de sécurité (Client-side checks)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { success: false as const, error: 'Fichier trop volumineux (max 5 Mo)' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false as const, error: 'Type de fichier invalide. Utilisez JPG, PNG ou WebP' };
    }

    // 2. Utilisation de la librairie partagée (Abstraction Cloudinary)
    // On wrap l'appel dans ResultAsync pour maintenir la cohérence de gestion d'erreur du projet
    return ResultAsync.fromPromise(
        uploadPublicImage(file, 'gallery'), // 'gallery' est le sous-dossier Cloudinary
        (error: unknown) => {
            console.error('Cloudinary Upload Error:', error);
            return error instanceof Error ? error.message : "Erreur lors de l'upload sur le cloud";
        }
    ).match(
        (publicUrl) => ({ success: true as const, url: publicUrl }),
        (error) => ({ success: false as const, error })
    );
}

export async function reorderGalleryImagesAction(items: { id: string; order: number }[]) {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new ReorderGalleryImagesUseCase(repository);

    return useCase.execute(items).match(
        () => {
            revalidatePath('/content/gallery');
            return { success: true as const };
        },
        (error) => ({ success: false as const, error })
    );
}

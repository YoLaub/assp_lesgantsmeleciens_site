'use server';

import { GalleryImageRepositoryImpl } from '@/features/gallery/data/repositories/gallery-image.repository.impl';
import { SaveGalleryImageUseCase } from '@/features/gallery/domain/usecases/save-gallery-image.usecase';
import { GetAllGalleryImagesUseCase } from '@/features/gallery/domain/usecases/getAll-gallery-images.usecase';
import { DeleteGalleryImageUseCase } from '@/features/gallery/domain/usecases/delete-gallery-image.usecase';
import { BulkDeleteGalleryImagesUseCase } from '@/features/gallery/domain/usecases/bulk-delete-gallery-images.usecase';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { revalidatePath } from 'next/cache';
import { ResultAsync } from '@/shared/lib/result';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

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

export async function uploadGalleryImageAction(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false as const, error: 'Aucun fichier fourni' };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { success: false as const, error: 'Fichier trop volumineux (max 5 Mo)' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return { success: false as const, error: 'Type de fichier invalide. Utilisez JPG, PNG ou WebP' };
    }

    const ext = file.name.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'gallery');
    const filepath = join(uploadDir, filename);

    return ResultAsync.fromPromise(
        file.arrayBuffer(),
        () => "Erreur lors de la lecture du fichier"
    )
    .andThen((bytes) =>
        ResultAsync.fromPromise(
            mkdir(uploadDir, { recursive: true }).then(() => writeFile(filepath, Buffer.from(bytes))),
            () => "Erreur lors de l'écriture du fichier sur le serveur"
        )
    )
    .match(
        () => ({ success: true as const, url: `/uploads/gallery/${filename}` }),
        (error) => ({ success: false as const, error })
    );
}

'use server';

import { GalleryImageRepositoryImpl } from '@/features/gallery/data/repositories/gallery-image.repository.impl';
import { SaveGalleryImageUseCase } from '@/features/gallery/domain/usecases/save-gallery-image.usecase';
import { GetAllGalleryImagesUseCase } from '@/features/gallery/domain/usecases/getAll-gallery-images.usecase';
import { DeleteGalleryImageUseCase } from '@/features/gallery/domain/usecases/delete-gallery-image.usecase';
import { BulkDeleteGalleryImagesUseCase } from '@/features/gallery/domain/usecases/bulk-delete-gallery-images.usecase';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function getAllGalleryImagesAction() {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new GetAllGalleryImagesUseCase(repository);

    try {
        const images = await useCase.execute();
        return { success: true as const, images };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}

export async function saveGalleryImageAction(data: GalleryImage) {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new SaveGalleryImageUseCase(repository);

    try {
        await useCase.execute(data);
        revalidatePath('/content/gallery');
        return { success: true as const };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}

export async function deleteGalleryImageAction(id: string) {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new DeleteGalleryImageUseCase(repository);

    try {
        await useCase.execute(id);
        revalidatePath('/content/gallery');
        return { success: true as const };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}

export async function bulkDeleteGalleryImagesAction(ids: string[]) {
    const repository = new GalleryImageRepositoryImpl();
    const useCase = new BulkDeleteGalleryImagesUseCase(repository);

    try {
        await useCase.execute(ids);
        revalidatePath('/content/gallery');
        return { success: true as const };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}

export async function uploadGalleryImageAction(formData: FormData) {
    try {
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

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name.split('.').pop();
        const filename = `${randomUUID()}.${ext}`;

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'gallery');
        await mkdir(uploadDir, { recursive: true });

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const publicUrl = `/uploads/gallery/${filename}`;

        return { success: true as const, url: publicUrl };
    } catch (error: unknown) {
        console.error('Upload error:', error);
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        return { success: false as const, error: message };
    }
}

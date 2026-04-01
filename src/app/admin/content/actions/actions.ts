'use server';

import { DisciplineRepositoryImpl } from '@/features/disciplines/data/repositories/discipline.repository.impl';
import { SaveDisciplineUseCase } from '@/features/disciplines/domain/usecases/save-discipline.usecase';
import { Discipline } from '@/features/disciplines/domain/models/discipline.model';
import { revalidatePath } from 'next/cache';
import { GetDisciplineUseCase } from "@/features/disciplines/domain/usecases/get-discipline.usecase";
import { GetAllDisciplinesUseCase } from "@/features/disciplines/domain/usecases/getAll-discipline.usecase";
import { uploadPublicImage } from '@/shared/lib/upload';
import { sanitizeRichText } from '@/shared/lib/sanitize';

import { ActualiteRepositoryImpl } from '@/features/actualites/data/repositories/actualite.repository.impl';
import { SaveActualiteUseCase } from '@/features/actualites/domain/usecases/save-actualite.usecase';
import { GetActualiteUseCase } from '@/features/actualites/domain/usecases/get-actualite.usecase';
import { GetAllActualitesUseCase } from '@/features/actualites/domain/usecases/getAll-actualite.usecase';
import { ReorderActualitesUseCase } from '@/features/actualites/domain/usecases/reorder-actualites.usecase';
import { Actualite } from '@/features/actualites/domain/models/actualite.model';
import { ReorderDisciplinesUseCase } from '@/features/disciplines/domain/usecases/reorder-disciplines.usecase';

export async function saveDisciplineAction(data: Discipline) {
    const sanitizedData = { ...data, description: sanitizeRichText(data.description) };
    const repository = new DisciplineRepositoryImpl();
    const useCase = new SaveDisciplineUseCase(repository);

    try {
        await useCase.execute(sanitizedData);
        revalidatePath('/admin/content/disciplines');
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

export async function getDisciplineByIdAction(id: string) {
    const repository = new DisciplineRepositoryImpl();
    const useCase = new GetDisciplineUseCase(repository);

    try {
        const discipline = await useCase.execute(id);
        return { success: true, discipline };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

export async function uploadPhotoAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Validation (On garde tes excellentes vérifications de sécurité !)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { success: false, error: 'File too large (max 5MB)' };
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Use JPG, PNG or WebP' };
        }

        const { blurDataUrl, ...asset } = await uploadPublicImage(file, 'disciplines');
        return { success: true, asset, blurDataUrl };

    } catch (error: unknown) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
        return { success: false, error: errorMessage };
    }
}

export async function getAllDisciplinesAction() {
    const repository = new DisciplineRepositoryImpl();
    const useCase = new GetAllDisciplinesUseCase(repository);

    try {
        const disciplines = await useCase.execute();
        return { success: true, disciplines };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

// ─── Actualités ───────────────────────────────────────────────

export async function saveActualiteAction(data: Actualite) {
    const sanitizedData = { ...data, description: sanitizeRichText(data.description) };
    const repository = new ActualiteRepositoryImpl();
    const useCase = new SaveActualiteUseCase(repository);

    try {
        await useCase.execute(sanitizedData);
        revalidatePath('/admin/content/actualites');
        revalidatePath('/actualites');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

export async function getActualiteByIdAction(id: string) {
    const repository = new ActualiteRepositoryImpl();
    const useCase = new GetActualiteUseCase(repository);

    try {
        const actualite = await useCase.execute(id);
        return { success: true, actualite };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

export async function getAllActualitesAction() {
    const repository = new ActualiteRepositoryImpl();
    const useCase = new GetAllActualitesUseCase(repository);

    try {
        const actualites = await useCase.execute();
        return { success: true, actualites };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

export async function uploadActualitePhotoAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: 'File too large (max 5MB)' };
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Use JPG, PNG or WebP' };
        }

        const { blurDataUrl, ...asset } = await uploadPublicImage(file, 'actualites');
        return { success: true, asset, blurDataUrl };

    } catch (error: unknown) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'upload";
        return { success: false, error: errorMessage };
    }
}

// ─── Reorder ─────────────────────────────────────────────────

export async function reorderDisciplinesAction(items: { id: string; order: number }[]) {
    const repository = new DisciplineRepositoryImpl();
    const useCase = new ReorderDisciplinesUseCase(repository);

    try {
        await useCase.execute(items);
        revalidatePath('/admin/content/disciplines');
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}

export async function reorderActualitesAction(items: { id: string; order: number }[]) {
    const repository = new ActualiteRepositoryImpl();
    const useCase = new ReorderActualitesUseCase(repository);

    try {
        await useCase.execute(items);
        revalidatePath('/admin/content/actualites');
        revalidatePath('/actualites');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
        return { success: false, error: errorMessage };
    }
}
'use server';

import { DisciplineRepositoryImpl } from '@/features/disciplines/data/repositories/discipline.repository.impl';
import { SaveDisciplineUseCase } from '@/features/disciplines/domain/usecases/save-discipline.usecase';
import { Discipline } from '@/features/disciplines/domain/models/discipline.model';
import { revalidatePath } from 'next/cache';
import { GetDisciplineUseCase } from "@/features/disciplines/domain/usecases/get-discipline.usecase";
import { GetAllDisciplinesUseCase } from "@/features/disciplines/domain/usecases/getAll-discipline.usecase";
import { uploadPublicImage } from '@/shared/lib/upload';

export async function saveDisciplineAction(data: Discipline) {
    const repository = new DisciplineRepositoryImpl();
    const useCase = new SaveDisciplineUseCase(repository);

    try {
        await useCase.execute(data);
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

        // 2. Magie Cloudinary : on appelle juste notre librairie
        // Elle se charge de convertir le fichier et de l'envoyer dans le cloud
        const publicUrl = await uploadPublicImage(file, 'disciplines');

        // On retourne la vraie URL en https://res.cloudinary.com/...
        return { success: true, url: publicUrl };

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
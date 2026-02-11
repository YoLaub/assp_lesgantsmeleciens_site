'use server';

import { DisciplineRepositoryImpl } from '@/features/disciplines/data/repositories/discipline.repository.impl';
import { SaveDisciplineUseCase } from '@/features/disciplines/domain/usecases/save-discipline.usecase';
import { Discipline } from '@/features/disciplines/domain/models/discipline.model';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function saveDisciplineAction(data: Discipline) {
    const repository = new DisciplineRepositoryImpl();
    const useCase = new SaveDisciplineUseCase(repository);

    try {
        await useCase.execute(data);
        revalidatePath('/content/disciplines');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadPhotoAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Validation
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { success: false, error: 'File too large (max 5MB)' };
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return { success: false, error: 'Invalid file type. Use JPG, PNG or WebP' };
        }

        // Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const filename = `${randomUUID()}.${ext}`;

        // Save to public/uploads/disciplines
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'disciplines');
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/disciplines/${filename}`;

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}
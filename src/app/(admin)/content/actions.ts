'use server';

import { DisciplineRepositoryImpl } from '@/features/disciplines/data/repositories/discipline.repository.impl';
import { SaveDisciplineUseCase } from '@/features/disciplines/domain/usecases/save-discipline.usecase';
import { Discipline } from '@/features/disciplines/domain/models/discipline.model';
import { revalidatePath } from 'next/cache';

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
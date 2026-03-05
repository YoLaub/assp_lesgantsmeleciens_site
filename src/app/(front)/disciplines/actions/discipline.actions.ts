'use server';

import { DisciplineRepositoryImpl } from '@/features/disciplines/data/repositories/discipline.repository.impl';
import { GetActiveDisciplinesUseCase } from '@/features/disciplines/domain/usecases/get-active-disciplines.usecase';

// On encapsule la logique métier et l'accès aux données ici
export async function getActiveDisciplinesAction() {
    try {
        const repository = new DisciplineRepositoryImpl();
        const useCase = new GetActiveDisciplinesUseCase(repository);

        const disciplines = await useCase.execute();

        return { success: true, data: disciplines };
    } catch (error) {
        // Si la BDD plante (ETIMEDOUT, etc.), on attrape l'erreur au lieu de crasher le site !
        console.error("Erreur de récupération des disciplines :", error);
        return { success: false, data: [], error: "Impossible de charger les disciplines pour le moment." };
    }
}
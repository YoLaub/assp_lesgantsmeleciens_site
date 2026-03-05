'use server';

import { ActualiteRepositoryImpl } from '@/features/actualites/data/repositories/actualite.repository.impl';
import { GetActiveActualitesUseCase } from '@/features/actualites/domain/usecases/get-active-actualites.usecase';
import { GetActualiteUseCase } from '@/features/actualites/domain/usecases/get-actualite.usecase';
import { GetFeaturedActualiteUseCase } from '@/features/actualites/domain/usecases/get-featured-actualite.usecase';

export async function getActiveActualitesAction() {
    try {
        const repository = new ActualiteRepositoryImpl();
        const useCase = new GetActiveActualitesUseCase(repository);
        const actualites = await useCase.execute();
        return { success: true, data: actualites };
    } catch (error) {
        console.error("Erreur de récupération des actualités :", error);
        return { success: false, data: [], error: "Impossible de charger les actualités pour le moment." };
    }
}

export async function getActualiteAction(id: string) {
    try {
        const repository = new ActualiteRepositoryImpl();
        const useCase = new GetActualiteUseCase(repository);
        const actualite = await useCase.execute(id);
        return { success: true, data: actualite };
    } catch (error) {
        console.error("Erreur de récupération de l'actualité :", error);
        return { success: false, data: null, error: "Impossible de charger l'actualité." };
    }
}

export async function getFeaturedActualiteAction() {
    try {
        const repository = new ActualiteRepositoryImpl();
        const useCase = new GetFeaturedActualiteUseCase(repository);
        const featured = await useCase.execute();
        return { success: true, data: featured };
    } catch (error) {
        console.error("Erreur de récupération de l'actualité en vedette :", error);
        return { success: false, data: null, error: "Impossible de charger l'actualité en vedette." };
    }
}

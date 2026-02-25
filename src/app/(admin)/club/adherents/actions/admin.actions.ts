'use server';

import { InscriptionsRepositoryImpl } from "@/features/inscriptions/data/repositories/inscriptions.repository.impl";
import { InscriptionStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function updateInscriptionStatusAction(id: string, newStatus: InscriptionStatus) {
    if (!id) return { success: false, error: "ID manquant" };

    try {
        const repository = new InscriptionsRepositoryImpl();

        // 1. Mise à jour en base de données
        await repository.updateStatus(id, newStatus);

        revalidatePath('/club/adherents');

        return { success: true };
    } catch (error: unknown) {
        console.error("Erreur de mise à jour:", error);
        return { success: false, error: "Erreur lors de la mise à jour du statut" };
    }
}
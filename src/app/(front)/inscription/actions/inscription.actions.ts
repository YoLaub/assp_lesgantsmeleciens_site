'use server';

import { InscriptionSchema } from "@/features/inscriptions/presentation/schemas/inscription.schema";
import { InscriptionsRepositoryImpl } from "@/features/inscriptions/data/repositories/inscriptions.repository.impl";
import { Inscription } from "@/features/inscriptions/domain/models/inscriptions.model";
import { InscriptionStatus } from "@/generated/prisma/enums";

export async function submitInscriptionAction(formData: FormData, documentUrls: {type: any, url: string}[]) {
    const repository = new InscriptionsRepositoryImpl();

    // 1. Validation des données
    const rawData = Object.fromEntries(formData.entries());
    const validated = InscriptionSchema.safeParse(rawData);

    if (!validated.success) {
        return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    try {
        const adherentData: Inscription = {
            ...validated.data,
            status: validated.data.paymentMethod === "CHECK" ? "PENDING" : "UNPAID",
            documents: documentUrls
        };

        const result = await repository.save(adherentData);

        // TODO: Si Stripe, générer ici la session et retourner l'URL
        // if (validated.data.paymentMethod === "STRIPE") { ... }

        return { success: true, id: result.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
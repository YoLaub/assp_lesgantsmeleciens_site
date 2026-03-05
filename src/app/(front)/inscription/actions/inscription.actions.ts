'use server';

import { Inscription } from "@/features/inscriptions/domain/models/inscriptions.model";
import { InscriptionsRepositoryImpl } from "@/features/inscriptions/data/repositories/inscriptions.repository.impl";
import { InscriptionStatus, PaymentMethod, DocumentType } from "@/generated/prisma/enums";

export async function submitInscriptionAction(
    data: Inscription,
    documentUrls: { type: DocumentType, url: string }[]
) {
    const repository = new InscriptionsRepositoryImpl();

    const validated = Inscription.safeParse(data);

    if (!validated.success) {
        return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    try {
        const adherentData: Inscription = {
            ...validated.data,
            status: validated.data.paymentMethod === PaymentMethod.CHECK
                ? InscriptionStatus.PENDING
                : InscriptionStatus.UNPAID,
            documents: documentUrls
        };

        const result = await repository.save(adherentData);

        // TODO: Si Stripe, générer ici la session Checkout et retourner l'URL
        // if (validated.data.paymentMethod === PaymentMethod.STRIPE) { ... }

        return { success: true, id: result?.id };

    } catch (error: unknown) {
        // On vérifie proprement si l'erreur est une vraie erreur JS
        const errorMessage = error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue";

        return { success: false, error: errorMessage };
    }
}
'use server';

// On importe notre fameuse "Single Source of Truth" !
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

        return { success: true, id: result?.id }; // Adapter selon le retour réel de ton repository
        // 2. On remplace 'any' par 'unknown'
    } catch (error: unknown) {
        // On vérifie proprement si l'erreur est une vraie erreur JS
        const errorMessage = error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue";

        return { success: false, error: errorMessage };
    }
}
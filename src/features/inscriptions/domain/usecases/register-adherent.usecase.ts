import {Inscription} from "../models/inscriptions.model";
import {InscriptionsRepository } from "../repositories/inscriptions.repository";

export class RegisterAdherentUseCase {
    constructor(private repository: InscriptionsRepository) {}

    async execute(data: Inscription) {
        // Validation métier : âge minimum (ex: 6 ans)
        const today = new Date();
        const age = today.getFullYear() - data.birthDate.getFullYear();
        if (age < 6) {
            throw new Error("L'adhérent doit avoir au moins 6 ans.");
        }

        // Si paiement par chèque, le statut est PENDING
        if (data.paymentMethod === 'CHECK') {
            data.status = 'PENDING';
        }

        return await this.repository.save(data);
    }
}
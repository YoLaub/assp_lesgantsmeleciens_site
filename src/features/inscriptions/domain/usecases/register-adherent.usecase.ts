import {Inscription} from "../models/inscriptions.model";
import {InscriptionsRepository } from "../repositories/inscriptions.repository";
import { sendConfirmationEmail } from "@/shared/lib/mail";

export class RegisterAdherentUseCase {
    constructor(private repository: InscriptionsRepository) {}

    async execute(data: Inscription) {
        // Validation métier : âge minimum (ex: 6 ans)
        const today = new Date();
        const age = today.getFullYear() - data.birthDate.getFullYear();
        if (age < 6) {
            throw new Error("L'adhérent doit avoir au moins 6 ans.");
        }

        // 2. Persistance
        const result = await this.repository.save(data);

        // 3. Notification (Async - ne doit pas bloquer la réponse)
        if (result.id) {
            sendConfirmationEmail(data.email, `${data.firstName} ${data.lastName}`).catch(console.error);
        }

        return result;
    }
}
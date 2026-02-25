import { prisma } from "@/shared/lib/prisma";
import { Inscription } from "../../domain/models/inscriptions.model";
import { InscriptionsRepository } from "../../domain/repositories/inscriptions.repository";
import {InscriptionStatus} from "@/generated/prisma/enums";

export class InscriptionsRepositoryImpl implements InscriptionsRepository {
    getById(id: string): Promise<Inscription | null> {
        throw new Error("Method not implemented.");
    }
    async updateStatus(id: string, status: InscriptionStatus): Promise<void> {
        await prisma.inscription.update({ // ⚠️ Ou prisma.adherent.update (selon le nom exact de ta table Prisma)
            where: { id },
            data: { status }
        });
    }

    async save(data: Inscription): Promise<Inscription> {
        return await prisma.inscription.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                birthDate: data.birthDate,
                address: data.address,
                postalCode: data.postalCode,
                city: data.city,
                paymentMethod: data.paymentMethod,
                status: data.status,
                documents: {
                    create: data.documents?.map(doc => ({
                        type: doc.type,
                        url: doc.url
                    }))
                }
            }
        }) as unknown as Inscription;
    }

    async getAll(): Promise<Inscription[]> {
        return await prisma.inscription.findMany({
            include: { documents: true },
            orderBy: { createdAt: 'desc' }
        }) as unknown as Inscription[];
    }
}
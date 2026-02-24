import { prisma } from "@/shared/lib/prisma";
import { Inscription } from "../../domain/models/inscriptions.model";
import { InscriptionsRepository } from "../../domain/repositories/inscriptions.repository";

export class InscriptionsRepositoryImpl implements InscriptionsRepository {
    getById(id: string): Promise<Inscription | null> {
        throw new Error("Method not implemented.");
    }
    updateStatus(id: string, status: string): Promise<void> {
        throw new Error("Method not implemented.");
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
    // ... autres méthodes (getById, updateStatus)
}
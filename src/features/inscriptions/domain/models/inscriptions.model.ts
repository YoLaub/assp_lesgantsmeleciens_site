import { InscriptionStatus, PaymentMethod, DocumentType } from "@/generated/prisma/enums";

export type Inscription = {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: Date;
    address: string;
    postalCode: string;
    city: string;
    status: InscriptionStatus;
    paymentMethod: PaymentMethod;
    documents?: {
        type: DocumentType;
        url: string;
    }[];
};
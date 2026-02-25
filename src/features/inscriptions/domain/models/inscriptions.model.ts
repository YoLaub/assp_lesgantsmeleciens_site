import { z } from "zod";
import { InscriptionStatus, PaymentMethod, DocumentType } from "@/generated/prisma/enums";

// Le sous-schéma garde un nom classique pour un usage interne
const DocumentSchema = z.object({
    type: z.nativeEnum(DocumentType),
    url: z.string().url("URL du document invalide"),
});

// 1. LA CONSTANTE s'appelle "Inscription" (avec une majuscule)
export const Inscription = z.object({
    id: z.string().uuid().optional(),
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().regex(/^[0-9+ ]+$/, "Téléphone invalide"),
    birthDate: z.coerce.date({
        message: "La date de naissance est requise et doit être valide",
    }),
    address: z.string().min(5, "Adresse requise"),
    postalCode: z.string().min(5, "Code postal invalide"),
    city: z.string().min(2, "Ville requise"),
    status: z.nativeEnum(InscriptionStatus).default(InscriptionStatus.PENDING),
    paymentMethod: z.nativeEnum(PaymentMethod),
    documents: z.array(DocumentSchema).optional(),
});

// 2. LE TYPE s'appelle AUSSI "Inscription" !
export type Inscription = z.infer<typeof Inscription>;
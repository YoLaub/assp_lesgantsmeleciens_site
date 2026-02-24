import { z } from "zod";

export const InscriptionSchema = z.object({
    firstName: z.string().min(2, "Prénom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().regex(/^[0-9+ ]+$/, "Téléphone invalide"),
    birthDate: z.string().transform((str) => new Date(str)),
    address: z.string().min(5),
    postalCode: z.string().min(5),
    city: z.string().min(2),
    paymentMethod: z.enum(["STRIPE", "CHECK", "CASH"]),
});
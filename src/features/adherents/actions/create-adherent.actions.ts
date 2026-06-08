'use server';

import { prisma } from '@/shared/lib/prisma';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { genererNumeroMembreUnique, calculerCategorie } from '@/shared/lib/adherent-utils';
import {
    sendConfirmationInscription,
    sendNotificationNouveauDossier,
} from '@/shared/lib/mail';
import { StatutDocument } from '@/generated/prisma/enums';
import { z } from 'zod';

const CreateAdherentSchema = z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    dateDeNaissance: z.string().refine((d) => !isNaN(Date.parse(d))),
    sexe: z.enum(['M', 'F', 'autre']),
    email: z.string().email(),
    telephone1: z.string().optional(),
    oxygene: z.boolean().default(false),
    couponSport: z.boolean().default(false),
    bonCaf: z.boolean().default(false),
    codePassSport: z.string().optional(),
    hcaptchaToken: z.string().min(1),
    membreId: z.number().optional(), // si fourni → conversion depuis ESSAYANT
});

export type CreateAdherentInput = z.infer<typeof CreateAdherentSchema>;

export async function createAdherentAction(input: CreateAdherentInput) {
    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const parsed = CreateAdherentSchema.safeParse(input);
    if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

    const data = parsed.data;
    const dateNaissance = new Date(data.dateDeNaissance);
    const categorie = calculerCategorie(dateNaissance);

    const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
    if (!config) return { success: false, error: 'Configuration des tarifs introuvable' };

    const tarifBase = categorie === 'enfant' ? Number(config.tarifEnfant) : Number(config.tarifAdulte);
    let montant = tarifBase;
    if (data.oxygene) montant += Number(config.supplementOxygene);
    if (data.couponSport) montant -= Number(config.deductionCouponSport);

    const adherentExistant = await prisma.membre.findFirst({
        where: { email: data.email, inscriptionValide: true },
        select: { id: true },
    });
    const renouvellement = adherentExistant !== null;

    try {
        const membre = await prisma.$transaction(async (tx) => {
            const inscriptionData = {
                statut: 'ACTIF' as const,
                sexe: data.sexe,
                categorie,
                ...(data.telephone1 ? { telephone: data.telephone1 } : {}),
                oxygene: data.oxygene,
                renouvellement,
                couponSport: data.couponSport ? StatutDocument.declare : StatutDocument.non_fourni,
                bonCaf: data.bonCaf ? StatutDocument.declare : StatutDocument.non_fourni,
                ...(data.codePassSport ? { codePassSport: data.codePassSport } : {}),
                montantSnapshot: montant,
                dateInscription: new Date(),
            };

            if (data.membreId) {
                return tx.membre.update({
                    where: { id: data.membreId },
                    data: {
                        ...inscriptionData,
                        nom: data.nom,
                        prenom: data.prenom,
                        email: data.email,
                        dateDeNaissance: dateNaissance,
                    },
                });
            } else {
                const numeroAdherent = await genererNumeroMembreUnique();
                return tx.membre.create({
                    data: {
                        ...inscriptionData,
                        nom: data.nom,
                        prenom: data.prenom,
                        email: data.email,
                        telephone: data.telephone1 ?? null,
                        dateDeNaissance: dateNaissance,
                        numeroAdherent,
                    },
                });
            }
        });

        if (!membre.numeroAdherent) {
            console.error('[createAdherentAction] numeroAdherent manquant après transaction');
            return { success: true, numeroAdherent: null };
        }

        try {
            await sendConfirmationInscription({
                email: membre.email,
                prenom: membre.prenom,
                numeroAdherent: membre.numeroAdherent,
                certificatRequis: false,
            });
        } catch (e) {
            console.error('[createAdherentAction] sendConfirmationInscription', e);
        }

        try {
            await sendNotificationNouveauDossier({
                nom: membre.nom,
                prenom: membre.prenom,
                numeroAdherent: membre.numeroAdherent,
                categorie: String(categorie),
                montant,
                typePaiement: null,
                certificatRequis: false,
                adherentId: membre.id,
            });
        } catch (e) {
            console.error('[createAdherentAction] sendNotificationNouveauDossier', e);
        }

        return { success: true, numeroAdherent: membre.numeroAdherent };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Erreur inattendue';
        if (msg.includes('Unique constraint') && msg.includes('email')) {
            return { success: false, error: 'Un dossier existe déjà avec cet email.' };
        }
        console.error('[createAdherentAction]', error);
        return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
    }
}

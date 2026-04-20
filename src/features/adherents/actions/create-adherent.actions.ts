'use server';

import { prisma } from '@/shared/lib/prisma';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { genererNumeroAdherentUnique, calculerCategorie } from '@/shared/lib/adherent-utils';
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
    telephone1: z.string().min(1),
    oxygene: z.boolean().default(false),
    couponSport: z.boolean().default(false),
    bonCaf: z.boolean().default(false),
    hcaptchaToken: z.string().min(1),
    // Lien essayant optionnel
    essayantId: z.number().optional(),
    numeroAdherentExistant: z.string().optional(),
});

export type CreateAdherentInput = z.infer<typeof CreateAdherentSchema>;

export async function createAdherentAction(input: CreateAdherentInput) {
    // 1. Vérifier hCaptcha
    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const parsed = CreateAdherentSchema.safeParse(input);
    if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

    const data = parsed.data;

    // 2. Calculer categorie
    const dateNaissance = new Date(data.dateDeNaissance);
    const categorie = calculerCategorie(dateNaissance);

    // 3. Récupérer config tarifs
    const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
    if (!config) return { success: false, error: 'Configuration des tarifs introuvable' };

    // 4. Calculer montantSnapshot (preview basé sur couponSport/bonCaf/oxygène)
    const tarifBase =
        categorie === 'enfant' ? Number(config.tarifEnfant)
        : categorie === 'ados' ? Number(config.tarifAdos)
        : Number(config.tarifAdulte);

    let montant = tarifBase;
    if (data.oxygene) montant += Number(config.supplementOxygene);
    if (data.couponSport) montant -= Number(config.deductionCouponSport);

    // 5. Générer ou réutiliser le numéro adhérent
    const numeroAdherent = data.numeroAdherentExistant ?? await genererNumeroAdherentUnique();

    try {
        // 6. Créer l'adhérent en transaction (sans questionnaire — rempli dans mon-dossier)
        const adherent = await prisma.$transaction(async (tx) => {
            const a = await tx.adherent.create({
                data: {
                    numeroAdherent,
                    nom: data.nom,
                    prenom: data.prenom,
                    dateDeNaissance: dateNaissance,
                    sexe: data.sexe,
                    email: data.email,
                    telephone1: data.telephone1,
                    oxygene: data.oxygene,
                    categorie,
                    couponSport: data.couponSport ? StatutDocument.declare : StatutDocument.non_fourni,
                    bonCaf: data.bonCaf ? StatutDocument.declare : StatutDocument.non_fourni,
                    montantSnapshot: montant,
                    essayantId: data.essayantId,
                },
            });

            // Si conversion depuis essayant, mettre à jour le lien
            if (data.essayantId) {
                await tx.essayant.update({
                    where: { id: data.essayantId },
                    data: { adherent: { connect: { id: a.id } } },
                });
            }

            return a;
        });

        // 7. Envoyer emails (hors transaction) — await pour garantir l'exécution sur Vercel serverless
        try {
            await sendConfirmationInscription({
                email: adherent.email,
                prenom: adherent.prenom,
                numeroAdherent: adherent.numeroAdherent,
                certificatRequis: false,
            });
        } catch (e) {
            console.error('[createAdherentAction] sendConfirmationInscription', e);
        }

        try {
            await sendNotificationNouveauDossier({
                nom: adherent.nom,
                prenom: adherent.prenom,
                numeroAdherent: adherent.numeroAdherent,
                categorie: String(categorie),
                montant,
                typePaiement: null,
                certificatRequis: false,
                adherentId: adherent.id,
            });
        } catch (e) {
            console.error('[createAdherentAction] sendNotificationNouveauDossier', e);
        }

        return {
            success: true,
            numeroAdherent: adherent.numeroAdherent,
        };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Erreur inattendue';
        if (msg.includes('Unique constraint') && msg.includes('email')) {
            return { success: false, error: 'Un dossier existe déjà avec cet email.' };
        }
        console.error('[createAdherentAction]', error);
        return { success: false, error: 'Une erreur est survenue lors de l\'enregistrement.' };
    }
}

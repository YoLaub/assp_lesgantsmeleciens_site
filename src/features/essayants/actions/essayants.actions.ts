'use server';

import { prisma } from '@/shared/lib/prisma';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { auth } from '@clerk/nextjs/server';
import { genererNumeroEssayantUnique } from '@/shared/lib/adherent-utils';
import {
    sendBienvenueEssayant,
    sendNotificationNouvelEssayant,
    sendRelanceEssayant,
    sendConversionEssayant,
    sendNotificationConversionAdmin,
    sendLienAccesEssai,
} from '@/shared/lib/mail';
import { z } from 'zod';

// ─── Création essayant ───────────────────────────────────────────────────────

const CreateEssayantSchema = z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    email: z.string().email(),
    telephone: z.string().min(6),
    dateDeNaissance: z.string().refine((d) => !isNaN(Date.parse(d))),
    hcaptchaToken: z.string().min(1),
});

export async function createEssayantAction(input: z.infer<typeof CreateEssayantSchema>) {
    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const parsed = CreateEssayantSchema.safeParse(input);
    if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

    const data = parsed.data;
    const numeroAdherent = await genererNumeroEssayantUnique();

    try {
        const accesToken = crypto.randomUUID();
        const accesTokenExpireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

        const essayant = await prisma.essayant.create({
            data: {
                numeroAdherent,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email,
                telephone: data.telephone,
                dateDeNaissance: new Date(data.dateDeNaissance),
                accesToken,
                accesTokenExpireLe,
            },
        });

        sendBienvenueEssayant({ email: essayant.email, prenom: essayant.prenom, numeroAdherent, accesToken }).catch(console.error);
        sendNotificationNouvelEssayant({ nom: essayant.nom, prenom: essayant.prenom, numeroAdherent, email: essayant.email, telephone: essayant.telephone }).catch(console.error);

        return { success: true, numeroAdherent };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('Unique constraint') && msg.includes('email')) {
            return { success: false, error: 'Un profil essayant existe déjà avec cet email.' };
        }
        console.error('[createEssayantAction]', error);
        return { success: false, error: "Erreur lors de l'enregistrement." };
    }
}

// ─── Demande lien accès Mon Essai ────────────────────────────────────────────

export async function requestAccesEssaiAction(input: {
    email: string;
    numeroAdherent: string;
    hcaptchaToken: string;
}) {
    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const essayant = await prisma.essayant.findFirst({
        where: { email: input.email, numeroAdherent: input.numeroAdherent },
    });

    if (essayant) {
        const token = crypto.randomUUID();
        const expireLe = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.essayant.update({
            where: { id: essayant.id },
            data: { accesToken: token, accesTokenExpireLe: expireLe },
        });

        sendLienAccesEssai({ email: essayant.email, prenom: essayant.prenom, token }).catch(console.error);
    }

    return { success: true };
}

// ─── Lecture profil essayant ─────────────────────────────────────────────────

export async function getMonEssaiAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const essayant = await prisma.essayant.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
        include: { presences: { orderBy: { pointeLe: 'asc' } } },
    });

    if (!essayant) return { success: false, error: 'Lien invalide ou expiré' };

    return {
        success: true,
        essayant: {
            id: essayant.id,
            numeroAdherent: essayant.numeroAdherent,
            nom: essayant.nom,
            prenom: essayant.prenom,
            nombrePresences: essayant.nombrePresences,
            accesBloque: essayant.accesBloque,
        },
        accesToken: essayant.accesToken,
    };
}

// ─── Pointage présence (coach) ───────────────────────────────────────────────

export async function pointerPresenceAction(essayantId: number, coachToken: string, nomCoach: string) {
    // Vérifier le coach token
    const token = await prisma.coachToken.findFirst({
        where: { token: coachToken, expireLe: { gt: new Date() } },
    });
    if (!token) return { success: false, error: 'Token coach invalide ou expiré' };

    const essayant = await prisma.essayant.findUnique({ where: { id: essayantId } });
    if (!essayant) return { success: false, error: 'Essayant introuvable' };
    if (essayant.accesBloque) return { success: false, error: 'Accès bloqué — 3 cours déjà effectués' };

    const nouvPresences = essayant.nombrePresences + 1;

    await prisma.$transaction([
        prisma.presenceEssai.create({
            data: { essayantId, pointePar: nomCoach },
        }),
        prisma.essayant.update({
            where: { id: essayantId },
            data: {
                nombrePresences: nouvPresences,
                accesBloque: nouvPresences >= 3,
                // Générer un token d'accès pour le lien de conversion si 3ème présence
                ...(nouvPresences === 3 ? {
                    accesToken: crypto.randomUUID(),
                    accesTokenExpireLe: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
                } : {}),
            },
        }),
    ]);

    // Emails
    if (nouvPresences === 1 || nouvPresences === 2) {
        sendRelanceEssayant({
            email: essayant.email,
            prenom: essayant.prenom,
            numeroAdherent: essayant.numeroAdherent,
            nombrePresences: nouvPresences,
        }).catch(console.error);
    }

    if (nouvPresences === 3) {
        const updated = await prisma.essayant.findUnique({ where: { id: essayantId } });
        if (updated?.accesToken) {
            sendConversionEssayant({
                email: essayant.email,
                prenom: essayant.prenom,
                numeroAdherent: essayant.numeroAdherent,
                accesToken: updated.accesToken,
            }).catch(console.error);
        }
        sendNotificationConversionAdmin({
            nom: essayant.nom,
            prenom: essayant.prenom,
            numeroAdherent: essayant.numeroAdherent,
        }).catch(console.error);
    }

    return { success: true, nombrePresences: nouvPresences };
}

// ─── Données de conversion (pré-remplissage formulaire) ──────────────────────

export async function getEssayantConversionDataAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const essayant = await prisma.essayant.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
    });

    if (!essayant) return { success: false, error: 'Lien invalide ou expiré' };

    return {
        success: true,
        data: {
            id: essayant.id,
            nom: essayant.nom,
            prenom: essayant.prenom,
            email: essayant.email,
            telephone: essayant.telephone,
            dateDeNaissance: essayant.dateDeNaissance.toISOString().split('T')[0],
            numeroAdherent: essayant.numeroAdherent,
        },
    };
}

// ─── Gestion token coach (admin) ─────────────────────────────────────────────

export async function genererCoachTokenAction() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const token = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    await prisma.coachToken.create({
        data: { token, expireLe, creePar: userId },
    });

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/coach?token=${token}`;
    return { success: true, url, token, expireLe };
}

export async function getCoachTokenActifAction() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const coachToken = await prisma.coachToken.findFirst({
        orderBy: { creeLe: 'desc' },
    });

    if (!coachToken) return { success: true, token: null };

    return {
        success: true,
        token: {
            id: coachToken.id,
            expireLe: coachToken.expireLe,
            actif: coachToken.expireLe > new Date(),
            url: `${process.env.NEXT_PUBLIC_APP_URL}/coach?token=${coachToken.token}`,
        },
    };
}

// ─── Liste essayants (tableau de bord coach) ─────────────────────────────────

export async function getEssayantsForCoachAction(coachToken: string) {
    const token = await prisma.coachToken.findFirst({
        where: { token: coachToken, expireLe: { gt: new Date() } },
    });
    if (!token) return { success: false, error: 'Token invalide ou expiré' };

    const essayants = await prisma.essayant.findMany({
        where: { adherent: null }, // non convertis uniquement
        orderBy: { nom: 'asc' },
        select: {
            id: true,
            numeroAdherent: true,
            nom: true,
            prenom: true,
            nombrePresences: true,
            accesBloque: true,
            presences: { orderBy: { pointeLe: 'desc' }, take: 1 },
        },
    });

    return { success: true, essayants };
}

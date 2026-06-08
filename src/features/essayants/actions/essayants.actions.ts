'use server';

import { prisma } from '@/shared/lib/prisma';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { auth } from '@clerk/nextjs/server';
import { genererNumeroMembreUnique } from '@/shared/lib/adherent-utils';
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
    const numeroAdherent = await genererNumeroMembreUnique();

    try {
        const accesToken = crypto.randomUUID();
        const accesTokenExpireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const membre = await prisma.membre.create({
            data: {
                statut: 'ESSAYANT',
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

        try {
            await sendBienvenueEssayant({ email: membre.email, prenom: membre.prenom, numeroAdherent, accesToken });
        } catch (e) {
            console.error('[createEssayantAction] sendBienvenueEssayant', e);
        }
        try {
            await sendNotificationNouvelEssayant({ nom: membre.nom, prenom: membre.prenom, numeroAdherent, email: membre.email, telephone: membre.telephone ?? '' });
        } catch (e) {
            console.error('[createEssayantAction] sendNotificationNouvelEssayant', e);
        }

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

    const membre = await prisma.membre.findFirst({
        where: { email: input.email, numeroAdherent: input.numeroAdherent, statut: 'ESSAYANT' },
    });

    if (membre) {
        const token = crypto.randomUUID();
        const expireLe = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.membre.update({
            where: { id: membre.id },
            data: { accesToken: token, accesTokenExpireLe: expireLe },
        });

        try {
            await sendLienAccesEssai({ email: membre.email, prenom: membre.prenom, token });
        } catch (e) {
            console.error('[requestAccesEssaiAction] sendLienAccesEssai', e);
        }
    }

    return { success: true };
}

// ─── Lecture profil essayant ─────────────────────────────────────────────────

export async function getMonEssaiAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await prisma.membre.findFirst({
        where: { statut: 'ESSAYANT', accesToken: token, accesTokenExpireLe: { gt: new Date() } },
        include: { presences: { orderBy: { pointeLe: 'asc' } } },
    });

    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    return {
        success: true,
        essayant: {
            id: membre.id,
            numeroAdherent: membre.numeroAdherent,
            nom: membre.nom,
            prenom: membre.prenom,
            nombrePresences: membre.nombrePresences,
            accesBloque: membre.accesBloque,
        },
        accesToken: membre.accesToken,
    };
}

// ─── Pointage présence (coach) ───────────────────────────────────────────────

export async function pointerPresenceAction(essayantId: number, coachToken: string, nomCoach: string) {
    const token = await prisma.coachToken.findFirst({
        where: { token: coachToken, expireLe: { gt: new Date() } },
    });
    if (!token) return { success: false, error: 'Token coach invalide ou expiré' };

    const membre = await prisma.membre.findUnique({ where: { id: essayantId } });
    if (!membre || membre.statut !== 'ESSAYANT') return { success: false, error: 'Essayant introuvable' };
    if (membre.accesBloque) return { success: false, error: 'Accès bloqué — 3 cours déjà effectués' };

    const nouvPresences = membre.nombrePresences + 1;

    await prisma.$transaction([
        prisma.presenceEssai.create({
            data: { membreId: essayantId, pointePar: nomCoach },
        }),
        prisma.membre.update({
            where: { id: essayantId },
            data: {
                nombrePresences: nouvPresences,
                accesBloque: nouvPresences >= 3,
                ...(nouvPresences === 3 ? {
                    accesToken: crypto.randomUUID(),
                    accesTokenExpireLe: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                } : {}),
            },
        }),
    ]);

    if (nouvPresences === 1 || nouvPresences === 2) {
        try {
            await sendRelanceEssayant({
                email: membre.email,
                prenom: membre.prenom,
                numeroAdherent: membre.numeroAdherent!,
                nombrePresences: nouvPresences,
            });
        } catch (e) {
            console.error('[pointerPresenceAction] sendRelanceEssayant', e);
        }
    }

    if (nouvPresences === 3) {
        const updated = await prisma.membre.findUnique({ where: { id: essayantId } });
        if (updated?.accesToken) {
            try {
                await sendConversionEssayant({
                    email: membre.email,
                    prenom: membre.prenom,
                    numeroAdherent: membre.numeroAdherent!,
                    accesToken: updated.accesToken,
                });
            } catch (e) {
                console.error('[pointerPresenceAction] sendConversionEssayant', e);
            }
        }
        try {
            await sendNotificationConversionAdmin({
                nom: membre.nom,
                prenom: membre.prenom,
                numeroAdherent: membre.numeroAdherent!,
            });
        } catch (e) {
            console.error('[pointerPresenceAction] sendNotificationConversionAdmin', e);
        }
    }

    return { success: true, nombrePresences: nouvPresences };
}

// ─── Données de conversion (pré-remplissage formulaire) ──────────────────────

export async function getEssayantConversionDataAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await prisma.membre.findFirst({
        where: { statut: 'ESSAYANT', accesToken: token, accesTokenExpireLe: { gt: new Date() } },
    });

    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    return {
        success: true,
        data: {
            id: membre.id,
            nom: membre.nom,
            prenom: membre.prenom,
            email: membre.email,
            telephone: membre.telephone ?? '',
            dateDeNaissance: membre.dateDeNaissance.toISOString().split('T')[0],
            numeroAdherent: membre.numeroAdherent,
        },
    };
}

// ─── Gestion token coach (admin) ─────────────────────────────────────────────

export async function genererCoachTokenAction() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const token = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.coachToken.create({
        data: { token, expireLe, creePar: userId },
    });

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/coach?token=${token}`;
    return { success: true, url, token, expireLe };
}

export async function getCoachTokenActifAction() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const coachToken = await prisma.coachToken.findFirst({ orderBy: { creeLe: 'desc' } });
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

    const essayants = await prisma.membre.findMany({
        where: { statut: 'ESSAYANT' },
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

'use server';

import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { checkRateLimit } from '@/shared/lib/rate-limit';
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
import { EssayantRepositoryImpl } from '../data/repositories/essayant.repository.impl';
import { CreateEssayantUseCase } from '../domain/usecases/create-essayant.usecase';
import { RequestAccesEssaiUseCase } from '../domain/usecases/request-acces-essai.usecase';
import { GetEssayantByTokenUseCase } from '../domain/usecases/get-essayant-by-token.usecase';
import { PointerPresenceUseCase } from '../domain/usecases/pointer-presence.usecase';
import { GetEssayantConversionDataUseCase } from '../domain/usecases/get-essayant-conversion-data.usecase';
import { GenererCoachTokenUseCase } from '../domain/usecases/generer-coach-token.usecase';
import { GetCoachTokenActifUseCase } from '../domain/usecases/get-coach-token-actif.usecase';
import { GetEssayantsForCoachUseCase } from '../domain/usecases/get-essayants-for-coach.usecase';

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
    const allowed = await checkRateLimit('essai');
    if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const parsed = CreateEssayantSchema.safeParse(input);
    if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

    const data = parsed.data;
    const numeroAdherent = await genererNumeroEssayantUnique();

    const repo = new EssayantRepositoryImpl();
    const useCase = new CreateEssayantUseCase(repo);
    const result = await useCase.execute({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        dateDeNaissance: new Date(data.dateDeNaissance),
        numeroAdherent,
    });

    if (result.isErr()) {
        const msg = result.error;
        if (msg.includes('Unique constraint') && msg.includes('email')) {
            return { success: false, error: 'Un profil essayant existe déjà avec cet email.' };
        }
        console.error('[createEssayantAction]', msg);
        return { success: false, error: "Erreur lors de l'enregistrement." };
    }

    const essayant = result.value;

    try {
        await sendBienvenueEssayant({
            email: essayant.email,
            prenom: essayant.prenom,
            numeroAdherent,
            accesToken: essayant.accesToken!,
        });
    } catch (e) {
        console.error('[createEssayantAction] sendBienvenueEssayant', e);
    }
    try {
        await sendNotificationNouvelEssayant({
            nom: essayant.nom,
            prenom: essayant.prenom,
            numeroAdherent,
            email: essayant.email,
            telephone: essayant.telephone,
        });
    } catch (e) {
        console.error('[createEssayantAction] sendNotificationNouvelEssayant', e);
    }

    return { success: true, numeroAdherent };
}

// ─── Demande lien accès Mon Essai ────────────────────────────────────────────

export async function requestAccesEssaiAction(input: {
    email: string;
    numeroAdherent: string;
    hcaptchaToken: string;
}) {
    const allowed = await checkRateLimit('acces-essai');
    if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const repo = new EssayantRepositoryImpl();
    const useCase = new RequestAccesEssaiUseCase(repo);
    const result = await useCase.execute(input.email, input.numeroAdherent);

    if (result.isErr()) return { success: true }; // ne pas révéler si l'email existe

    const { found, essayant, token } = result.value;

    if (found && essayant && token) {
        try {
            await sendLienAccesEssai({ email: essayant.email, prenom: essayant.prenom, token });
        } catch (e) {
            console.error('[requestAccesEssaiAction] sendLienAccesEssai', e);
        }
    }

    return { success: true };
}

// ─── Lecture profil essayant ─────────────────────────────────────────────────

export async function getMonEssaiAction(token: string) {
    const repo = new EssayantRepositoryImpl();
    const useCase = new GetEssayantByTokenUseCase(repo);
    const result = await useCase.execute(token);

    if (result.isErr()) return { success: false, error: result.error };

    const essayant = result.value;
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
    const repo = new EssayantRepositoryImpl();

    // Récupérer l'essayant pour les emails (avant modification)
    const essayantResult = await repo.findById(essayantId);
    const essayant = essayantResult.isOk() ? essayantResult.value : null;

    const useCase = new PointerPresenceUseCase(repo);
    const result = await useCase.execute(essayantId, coachToken, nomCoach);

    if (result.isErr()) return { success: false, error: result.error };

    const { nombrePresences, accesToken } = result.value;

    if (!essayant) return { success: true, nombrePresences };

    if (nombrePresences === 1 || nombrePresences === 2) {
        try {
            await sendRelanceEssayant({
                email: essayant.email,
                prenom: essayant.prenom,
                numeroAdherent: essayant.numeroAdherent,
                nombrePresences,
            });
        } catch (e) {
            console.error('[pointerPresenceAction] sendRelanceEssayant', e);
        }
    }

    if (nombrePresences === 3 && accesToken) {
        try {
            await sendConversionEssayant({
                email: essayant.email,
                prenom: essayant.prenom,
                numeroAdherent: essayant.numeroAdherent,
                accesToken,
            });
        } catch (e) {
            console.error('[pointerPresenceAction] sendConversionEssayant', e);
        }
        try {
            await sendNotificationConversionAdmin({
                nom: essayant.nom,
                prenom: essayant.prenom,
                numeroAdherent: essayant.numeroAdherent,
            });
        } catch (e) {
            console.error('[pointerPresenceAction] sendNotificationConversionAdmin', e);
        }
    }

    return { success: true, nombrePresences };
}

// ─── Données de conversion (pré-remplissage formulaire) ──────────────────────

export async function getEssayantConversionDataAction(token: string) {
    const repo = new EssayantRepositoryImpl();
    const useCase = new GetEssayantConversionDataUseCase(repo);
    const result = await useCase.execute(token);

    if (result.isErr()) return { success: false, error: result.error };

    return { success: true, data: result.value };
}

// ─── Gestion token coach (admin) ─────────────────────────────────────────────

export async function genererCoachTokenAction() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const repo = new EssayantRepositoryImpl();
    const useCase = new GenererCoachTokenUseCase(repo);
    const result = await useCase.execute(userId);

    if (result.isErr()) return { success: false, error: result.error };

    const coachToken = result.value;
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/coach?token=${coachToken.token}`;
    return { success: true, url, token: coachToken.token, expireLe: coachToken.expireLe };
}

export async function getCoachTokenActifAction() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const repo = new EssayantRepositoryImpl();
    const useCase = new GetCoachTokenActifUseCase(repo);
    const result = await useCase.execute();

    if (result.isErr()) return { success: false, error: result.error };

    const coachToken = result.value;
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
    const repo = new EssayantRepositoryImpl();
    const useCase = new GetEssayantsForCoachUseCase(repo);
    const result = await useCase.execute(coachToken);

    if (result.isErr()) return { success: false, error: result.error };

    return { success: true, essayants: result.value };
}

'use server';

import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { checkRateLimit } from '@/shared/lib/rate-limit';
import { genererNumeroAdherentUnique } from '@/shared/lib/adherent-utils';
import {
    sendConfirmationInscription,
    sendNotificationNouveauDossier,
} from '@/shared/lib/mail';
import { z } from 'zod';
import { AdherentRepositoryImpl } from '../data/repositories/adherent.repository.impl';
import { CreateAdherentUseCase } from '../domain/usecases/create-adherent.usecase';
import { GetConfigTarifsUseCase } from '../domain/usecases/get-config-tarifs.usecase';

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
    essayantId: z.number().optional(),
    numeroAdherentExistant: z.string().optional(),
});

export type CreateAdherentInput = z.infer<typeof CreateAdherentSchema>;

export async function createAdherentAction(input: CreateAdherentInput) {
    const allowed = await checkRateLimit('adhesion');
    if (!allowed) return { success: false, error: 'Trop de tentatives. Réessayez dans quelques minutes.' };

    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const parsed = CreateAdherentSchema.safeParse(input);
    if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };

    const data = parsed.data;
    const repo = new AdherentRepositoryImpl();

    const configResult = await new GetConfigTarifsUseCase(repo).execute();
    if (configResult.isErr()) return { success: false, error: 'Configuration des tarifs introuvable' };
    const config = configResult.value;
    if (!config) return { success: false, error: 'Configuration des tarifs introuvable' };

    const renouvellementResult = await repo.findByEmail(data.email);
    const renouvellement = renouvellementResult.isOk() && renouvellementResult.value !== null;

    const numeroAdherent = data.numeroAdherentExistant ?? await genererNumeroAdherentUnique();

    const useCase = new CreateAdherentUseCase(repo);
    const result = await useCase.execute({
        nom: data.nom,
        prenom: data.prenom,
        dateDeNaissance: new Date(data.dateDeNaissance),
        sexe: data.sexe,
        email: data.email,
        telephone1: data.telephone1,
        oxygene: data.oxygene,
        couponSport: data.couponSport,
        bonCaf: data.bonCaf,
        codePassSport: data.codePassSport,
        essayantId: data.essayantId,
        numeroAdherent,
        renouvellement,
        config,
    });

    if (result.isErr()) {
        const msg = result.error;
        if (msg.includes('Unique constraint') && msg.includes('email')) {
            return { success: false, error: 'Un dossier existe déjà avec cet email.' };
        }
        console.error('[createAdherentAction]', msg);
        return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
    }

    const adherent = result.value;

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
            categorie: String(adherent.categorie),
            montant: adherent.montantSnapshot ?? 0,
            typePaiement: null,
            certificatRequis: false,
            adherentId: adherent.id,
        });
    } catch (e) {
        console.error('[createAdherentAction] sendNotificationNouveauDossier', e);
    }

    return { success: true, numeroAdherent: adherent.numeroAdherent };
}

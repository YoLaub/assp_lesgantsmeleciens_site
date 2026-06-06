'use server';

import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { sendLienAccesDossier } from '@/shared/lib/mail';
import { uploadDocumentFile } from '@/shared/lib/upload';
import Stripe from 'stripe';
import { z } from 'zod';
import { AdherentRepositoryImpl } from '../data/repositories/adherent.repository.impl';
import { RequestAccesDossierUseCase } from '../domain/usecases/request-acces-dossier.usecase';
import { GetAdherentByTokenUseCase } from '../domain/usecases/get-adherent-by-token.usecase';
import { SoumettreQuestionnaireUseCase } from '../domain/usecases/soumettre-questionnaire.usecase';
import { SignerReglementUseCase } from '../domain/usecases/signer-reglement.usecase';
import { SetTypePaiementUseCase } from '../domain/usecases/set-type-paiement.usecase';
import { DeclarerCertificatUseCase } from '../domain/usecases/declarer-certificat.usecase';
import { UpdateTelephoneUseCase } from '../domain/usecases/update-telephone.usecase';
import { UpdateDroitImageUseCase } from '../domain/usecases/update-droit-image.usecase';
import { ValiderEngagementUseCase } from '../domain/usecases/valider-engagement.usecase';
import { SaveDocumentAdherentUseCase } from '../domain/usecases/save-document-adherent.usecase';
import { ValidateCheckoutAdherentUseCase } from '../domain/usecases/validate-checkout-adherent.usecase';
import { GetConfigTarifsUseCase } from '../domain/usecases/get-config-tarifs.usecase';

// ─── Accès dossier ────────────────────────────────────────────────────────────

export async function requestAccesDossierAction(input: {
    email: string;
    numeroAdherent: string;
    hcaptchaToken: string;
}) {
    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const repo = new AdherentRepositoryImpl();
    const useCase = new RequestAccesDossierUseCase(repo);
    const result = await useCase.execute(input.email, input.numeroAdherent);

    if (result.isErr()) return { success: true }; // ne pas révéler si l'email existe

    const { found, adherent, token } = result.value;

    if (found && adherent && token) {
        try {
            await sendLienAccesDossier({ email: adherent.email, prenom: adherent.prenom, token });
        } catch (e) {
            console.error('[requestAccesDossierAction] sendLienAccesDossier', e);
        }
    }

    return { success: true };
}

export async function getMonDossierAction(token: string) {
    const repo = new AdherentRepositoryImpl();
    const useCase = new GetAdherentByTokenUseCase(repo);
    const result = await useCase.execute(token);

    if (result.isErr()) return { success: false, error: result.error };

    const adherent = result.value;
    return {
        success: true,
        adherent: {
            id: adherent.id,
            numeroAdherent: adherent.numeroAdherent,
            nom: adherent.nom,
            prenom: adherent.prenom,
            email: adherent.email,
            categorie: adherent.categorie,
            dateDeNaissance: adherent.dateDeNaissance,
            telephone1: adherent.telephone1,
            telephone2: adherent.telephone2,
            oxygene: adherent.oxygene,
            reglementSigne: adherent.reglementSigne,
            certificatMedical: adherent.certificatMedical,
            certificatMedicalReq: adherent.certificatMedicalReq,
            autorisationParentale: adherent.autorisationParentale,
            couponSport: adherent.couponSport,
            bonCaf: adherent.bonCaf,
            droitImage: adherent.droitImage,
            engagementPrisConnaissance: adherent.engagementPrisConnaissance,
            documents: adherent.documents.map((d) => ({ id: d.id, type: d.type, url: d.url, name: d.name })),
            montantSnapshot: adherent.montantSnapshot,
            typePaiement: adherent.typePaiement,
            inscriptionValide: adherent.inscriptionValide,
            stripeSessionId: adherent.stripeSessionId,
            questionnaire: adherent.questionnaire
                ? {
                      q1: adherent.questionnaire.q1,
                      q2: adherent.questionnaire.q2,
                      q3: adherent.questionnaire.q3,
                      q4: adherent.questionnaire.q4,
                      q5: adherent.questionnaire.q5,
                      q6: adherent.questionnaire.q6,
                      q7: adherent.questionnaire.q7,
                      q8: adherent.questionnaire.q8,
                      q9: adherent.questionnaire.q9,
                  }
                : null,
        },
    };
}

// ─── Complétion du dossier ────────────────────────────────────────────────────

const QuestionnaireSchema = z.object({
    q1: z.boolean(), q2: z.boolean(), q3: z.boolean(), q4: z.boolean(), q5: z.boolean(),
    q6: z.boolean(), q7: z.boolean(), q8: z.boolean(), q9: z.boolean(),
});

export async function soumettreQuestionnaireAction(
    token: string,
    reponses: z.infer<typeof QuestionnaireSchema>
) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const adherent = adherentResult.value;
    const parsed = QuestionnaireSchema.safeParse(reponses);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    const result = await new SoumettreQuestionnaireUseCase(repo).execute(
        adherent.id,
        parsed.data,
        adherent.certificatMedical,
    );

    if (result.isErr()) return { success: false, error: result.error };
    return { success: true, certificatMedicalReq: result.value.certificatMedicalReq };
}

export async function signerReglementAction(token: string) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const result = await new SignerReglementUseCase(repo).execute(adherentResult.value.id);
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true };
}

export async function setTypePaiementAction(token: string, typePaiement: 'sur_place' | 'en_ligne') {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const result = await new SetTypePaiementUseCase(repo).execute(adherentResult.value.id, typePaiement);
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true };
}

export async function declarerCertificatAction(token: string) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const adherent = adherentResult.value;
    const result = await new DeclarerCertificatUseCase(repo).execute(adherent.id, adherent.certificatMedicalReq);
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true };
}

// ─── Coordonnées (B2) ────────────────────────────────────────────────────────

const UpdateTelephoneSchema = z.object({
    telephone1: z.string().min(6),
    telephone2: z.string().optional(),
});

export async function updateTelephoneAction(token: string, data: z.infer<typeof UpdateTelephoneSchema>) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const parsed = UpdateTelephoneSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Numéro invalide' };

    const result = await new UpdateTelephoneUseCase(repo).execute(
        adherentResult.value.id,
        parsed.data.telephone1,
        parsed.data.telephone2,
    );
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true };
}

// ─── Droit à l'image (B4) ────────────────────────────────────────────────────

export async function updateDroitImageAction(token: string, droitImage: boolean) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const result = await new UpdateDroitImageUseCase(repo).execute(adherentResult.value.id, droitImage);
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true };
}

// ─── Engagement pris connaissance (B6) ───────────────────────────────────────

export async function validerEngagementAction(token: string) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const result = await new ValiderEngagementUseCase(repo).execute(adherentResult.value.id);
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true };
}

// ─── Upload document (B3) ────────────────────────────────────────────────────

const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAILLE_MAX = 5 * 1024 * 1024;

export async function uploadDocumentAdherentAction(
    token: string,
    formData: FormData,
    type: 'MEDICAL_CERTIFICATE' | 'ID_PHOTO'
) {
    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'Aucun fichier fourni' };
    if (!TYPES_AUTORISES.includes(file.type)) return { success: false, error: 'Format non accepté (JPEG, PNG, WebP, PDF uniquement)' };
    if (file.size > TAILLE_MAX) return { success: false, error: 'Fichier trop volumineux (5 Mo max)' };

    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const { url } = await uploadDocumentFile(file, 'documents');

    const result = await new SaveDocumentAdherentUseCase(repo).execute(
        adherentResult.value.id,
        type,
        url,
        file.name,
    );
    if (result.isErr()) return { success: false, error: result.error };
    return { success: true, url };
}

// ─── Checkout Stripe ──────────────────────────────────────────────────────────

export async function createCheckoutAction(token: string) {
    const repo = new AdherentRepositoryImpl();
    const adherentResult = await new GetAdherentByTokenUseCase(repo).execute(token);
    if (adherentResult.isErr()) return { success: false, error: adherentResult.error };

    const adherent = adherentResult.value;
    const validationResult = await new ValidateCheckoutAdherentUseCase(repo).execute(adherent);
    if (validationResult.isErr()) return { success: false, error: validationResult.error };

    const { montantSnapshot } = validationResult.value;

    const configResult = await new GetConfigTarifsUseCase(repo).execute();
    const saison = configResult.isOk() && configResult.value ? configResult.value.saison : 'en cours';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    unit_amount: Math.round(montantSnapshot * 100),
                    product_data: { name: `Inscription ${saison} — Les Gants Méléciens` },
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${token}&paiement=succes`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${token}&paiement=annule`,
    });

    await repo.patchAdherent(adherent.id, { stripeSessionId: session.id });

    return { success: true, url: session.url };
}

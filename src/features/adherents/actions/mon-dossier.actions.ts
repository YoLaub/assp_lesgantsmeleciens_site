'use server';

import { prisma } from '@/shared/lib/prisma';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { sendLienAccesDossier } from '@/shared/lib/mail';
import { DocumentType, TypePaiement } from '@/generated/prisma/enums';
import { uploadDocumentFile } from '@/shared/lib/upload';
import Stripe from 'stripe';
import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findAdherentByToken(token: string) {
    return prisma.adherent.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
        include: { questionnaire: true },
    });
}

// ─── Accès dossier ────────────────────────────────────────────────────────────

export async function requestAccesDossierAction(input: {
    email: string;
    numeroAdherent: string;
    hcaptchaToken: string;
}) {
    const captchaOk = await verifyHCaptcha(input.hcaptchaToken);
    if (!captchaOk) return { success: false, error: 'Vérification hCaptcha échouée' };

    const adherent = await prisma.adherent.findFirst({
        where: { email: input.email, numeroAdherent: input.numeroAdherent },
    });

    if (adherent) {
        const token = crypto.randomUUID();
        const expireLe = new Date(Date.now() + 60 * 60 * 1000); // +1h

        await prisma.adherent.update({
            where: { id: adherent.id },
            data: { accesToken: token, accesTokenExpireLe: expireLe },
        });

        try {
            await sendLienAccesDossier({
                email: adherent.email,
                prenom: adherent.prenom,
                token,
            });
        } catch (e) {
            console.error('[requestAccesDossierAction] sendLienAccesDossier', e);
        }
    }

    return { success: true };
}

export async function getMonDossierAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const adherent = await prisma.adherent.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
        include: { questionnaire: true, documents: true },
    });

    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

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
            montantSnapshot: adherent.montantSnapshot ? Number(adherent.montantSnapshot) : null,
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
    q1: z.boolean(),
    q2: z.boolean(),
    q3: z.boolean(),
    q4: z.boolean(),
    q5: z.boolean(),
    q6: z.boolean(),
    q7: z.boolean(),
    q8: z.boolean(),
    q9: z.boolean(),
});

export async function soumettreQuestionnaireAction(
    token: string,
    reponses: z.infer<typeof QuestionnaireSchema>
) {
    if (!token) return { success: false, error: 'Token manquant' };

    const parsed = QuestionnaireSchema.safeParse(reponses);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    const { q1, q2, q3, q4, q5, q6, q7, q8, q9 } = parsed.data;
    const certificatMedicalReq = [q1, q2, q3, q4, q5, q6, q7, q8, q9].some(Boolean);

    await prisma.$transaction(async (tx) => {
        if (adherent.questionnaire) {
            await tx.questionnaireSanteReponses.update({
                where: { adherentId: adherent.id },
                data: { q1, q2, q3, q4, q5, q6, q7, q8, q9 },
            });
        } else {
            await tx.questionnaireSanteReponses.create({
                data: { adherentId: adherent.id, q1, q2, q3, q4, q5, q6, q7, q8, q9 },
            });
        }
        await tx.adherent.update({
            where: { id: adherent.id },
            data: {
                certificatMedicalReq,
                // Si certificat requis et non encore déclaré → reste non_fourni (l'adhérent devra le déclarer)
                // Si certificat plus requis → repasse à non_fourni
                certificatMedical: certificatMedicalReq ? adherent.certificatMedical : 'non_fourni',
            },
        });
    });

    return { success: true, certificatMedicalReq };
}

export async function signerReglementAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: { reglementSigne: 'declare' },
    });

    return { success: true };
}

export async function setTypePaiementAction(token: string, typePaiement: 'sur_place' | 'en_ligne') {
    if (!token) return { success: false, error: 'Token manquant' };
    if (!['sur_place', 'en_ligne'].includes(typePaiement)) return { success: false, error: 'Valeur invalide' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: { typePaiement: typePaiement as TypePaiement },
    });

    return { success: true };
}

export async function declarerCertificatAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };
    if (!adherent.certificatMedicalReq) return { success: false, error: 'Certificat non requis' };

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: { certificatMedical: 'declare' },
    });

    return { success: true };
}

// ─── Coordonnées (B2) ────────────────────────────────────────────────────────

const UpdateTelephoneSchema = z.object({
    telephone1: z.string().min(6),
    telephone2: z.string().optional(),
});

export async function updateTelephoneAction(token: string, data: z.infer<typeof UpdateTelephoneSchema>) {
    if (!token) return { success: false, error: 'Token manquant' };

    const parsed = UpdateTelephoneSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Numéro invalide' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: {
            telephone1: parsed.data.telephone1,
            telephone2: parsed.data.telephone2 ?? null,
        },
    });

    return { success: true };
}

// ─── Droit à l'image (B4) ────────────────────────────────────────────────────

export async function updateDroitImageAction(token: string, droitImage: boolean) {
    if (!token) return { success: false, error: 'Token manquant' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: { droitImage },
    });

    return { success: true };
}

// ─── Engagement pris connaissance (B6) ───────────────────────────────────────

export async function validerEngagementAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: { engagementPrisConnaissance: true },
    });

    return { success: true };
}

// ─── Upload document (B3) ────────────────────────────────────────────────────

const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

export async function uploadDocumentAdherentAction(
    token: string,
    formData: FormData,
    type: 'MEDICAL_CERTIFICATE' | 'ID_PHOTO'
) {
    if (!token) return { success: false, error: 'Token manquant' };

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'Aucun fichier fourni' };
    if (!TYPES_AUTORISES.includes(file.type)) return { success: false, error: 'Format non accepté (JPEG, PNG, WebP, PDF uniquement)' };
    if (file.size > TAILLE_MAX) return { success: false, error: 'Fichier trop volumineux (5 Mo max)' };

    const adherent = await findAdherentByToken(token);
    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };

    const { url } = await uploadDocumentFile(file, 'documents');

    await prisma.$transaction(async (tx) => {
        // Remplacer un document du même type s'il existe déjà
        await tx.document.deleteMany({ where: { adherentId: adherent.id, type: DocumentType[type] } });
        await tx.document.create({
            data: { adherentId: adherent.id, type: DocumentType[type], url, name: file.name },
        });
        if (type === 'MEDICAL_CERTIFICATE') {
            await tx.adherent.update({ where: { id: adherent.id }, data: { certificatMedical: 'declare' } });
        }
    });

    return { success: true, url };
}

// ─── Checkout Stripe ──────────────────────────────────────────────────────────

export async function createCheckoutAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const adherent = await prisma.adherent.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
    });

    if (!adherent) return { success: false, error: 'Lien invalide ou expiré' };
    if (adherent.typePaiement !== 'en_ligne') return { success: false, error: 'Mode de paiement non applicable' };
    if (adherent.inscriptionValide) return { success: false, error: 'Inscription déjà validée' };

    // Vérifier que tous les documents requis sont validés
    const documentsRequis = [
        adherent.reglementSigne,
        ...(adherent.certificatMedicalReq ? [adherent.certificatMedical] : []),
        ...(isMineur(adherent.dateDeNaissance) ? [adherent.autorisationParentale] : []),
    ];
    const tousValides = documentsRequis.every((s) => s === 'valide');
    if (!tousValides) return { success: false, error: 'Documents en attente de validation' };

    if (!adherent.montantSnapshot) return { success: false, error: 'Montant introuvable' };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
    const saison = config?.saison ?? 'en cours';

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    unit_amount: Math.round(Number(adherent.montantSnapshot) * 100),
                    product_data: { name: `Inscription ${saison} — Les Gants Méléciens` },
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${token}&paiement=succes`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${token}&paiement=annule`,
    });

    await prisma.adherent.update({
        where: { id: adherent.id },
        data: { stripeSessionId: session.id },
    });

    return { success: true, url: session.url };
}

function isMineur(dateDeNaissance: Date): boolean {
    const today = new Date();
    let age = today.getFullYear() - dateDeNaissance.getFullYear();
    const moisDiff = today.getMonth() - dateDeNaissance.getMonth();
    if (moisDiff < 0 || (moisDiff === 0 && today.getDate() < dateDeNaissance.getDate())) age--;
    return age < 18;
}

'use server';

import { prisma } from '@/shared/lib/prisma';
import { verifyHCaptcha } from '@/shared/lib/hcaptcha';
import { sendLienAccesDossier } from '@/shared/lib/mail';
import { DocumentType, TypePaiement } from '@/generated/prisma/enums';
import { uploadDocumentFile } from '@/shared/lib/upload';
import Stripe from 'stripe';
import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findMembreByToken(token: string) {
    return prisma.membre.findFirst({
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

    const membre = await prisma.membre.findFirst({
        where: { email: input.email, numeroAdherent: input.numeroAdherent },
    });

    if (membre) {
        const token = crypto.randomUUID();
        const expireLe = new Date(Date.now() + 60 * 60 * 1000); // +1h

        await prisma.membre.update({
            where: { id: membre.id },
            data: { accesToken: token, accesTokenExpireLe: expireLe },
        });

        try {
            await sendLienAccesDossier({
                email: membre.email,
                prenom: membre.prenom,
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

    const membre = await prisma.membre.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
        include: { questionnaire: true, documents: true },
    });

    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    return {
        success: true,
        adherent: {
            id: membre.id,
            numeroAdherent: membre.numeroAdherent,
            nom: membre.nom,
            prenom: membre.prenom,
            email: membre.email,
            categorie: membre.categorie,
            dateDeNaissance: membre.dateDeNaissance,
            telephone1: membre.telephone,
            telephone2: membre.telephone2,
            oxygene: membre.oxygene,
            reglementSigne: membre.reglementSigne,
            certificatMedical: membre.certificatMedical,
            certificatMedicalReq: membre.certificatMedicalReq,
            autorisationParentale: membre.autorisationParentale,
            couponSport: membre.couponSport,
            bonCaf: membre.bonCaf,
            droitImage: membre.droitImage,
            engagementPrisConnaissance: membre.engagementPrisConnaissance,
            documents: membre.documents.map((d) => ({ id: d.id, type: d.type, url: d.url, name: d.name })),
            montantSnapshot: membre.montantSnapshot ? Number(membre.montantSnapshot) : null,
            typePaiement: membre.typePaiement,
            inscriptionValide: membre.inscriptionValide,
            stripeSessionId: membre.stripeSessionId,
            questionnaire: membre.questionnaire
                ? {
                      q1: membre.questionnaire.q1,
                      q2: membre.questionnaire.q2,
                      q3: membre.questionnaire.q3,
                      q4: membre.questionnaire.q4,
                      q5: membre.questionnaire.q5,
                      q6: membre.questionnaire.q6,
                      q7: membre.questionnaire.q7,
                      q8: membre.questionnaire.q8,
                      q9: membre.questionnaire.q9,
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

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    const { q1, q2, q3, q4, q5, q6, q7, q8, q9 } = parsed.data;
    const certificatMedicalReq = [q1, q2, q3, q4, q5, q6, q7, q8, q9].some(Boolean);

    await prisma.$transaction(async (tx) => {
        if (membre.questionnaire) {
            await tx.questionnaireSanteReponses.update({
                where: { membreId: membre.id },
                data: { q1, q2, q3, q4, q5, q6, q7, q8, q9 },
            });
        } else {
            await tx.questionnaireSanteReponses.create({
                data: { membreId: membre.id, q1, q2, q3, q4, q5, q6, q7, q8, q9 },
            });
        }
        await tx.membre.update({
            where: { id: membre.id },
            data: {
                certificatMedicalReq,
                // Si certificat requis et non encore déclaré → reste non_fourni (l'adhérent devra le déclarer)
                // Si certificat plus requis → repasse à non_fourni
                certificatMedical: certificatMedicalReq ? membre.certificatMedical : 'non_fourni',
            },
        });
    });

    return { success: true, certificatMedicalReq };
}

export async function signerReglementAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.membre.update({
        where: { id: membre.id },
        data: { reglementSigne: 'declare' },
    });

    return { success: true };
}

export async function setTypePaiementAction(token: string, typePaiement: 'sur_place' | 'en_ligne') {
    if (!token) return { success: false, error: 'Token manquant' };
    if (!['sur_place', 'en_ligne'].includes(typePaiement)) return { success: false, error: 'Valeur invalide' };

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.membre.update({
        where: { id: membre.id },
        data: { typePaiement: typePaiement as TypePaiement },
    });

    return { success: true };
}

export async function declarerCertificatAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };
    if (!membre.certificatMedicalReq) return { success: false, error: 'Certificat non requis' };

    await prisma.membre.update({
        where: { id: membre.id },
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

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.membre.update({
        where: { id: membre.id },
        data: {
            telephone: parsed.data.telephone1,
            telephone2: parsed.data.telephone2 ?? null,
        },
    });

    return { success: true };
}

// ─── Droit à l'image (B4) ────────────────────────────────────────────────────

export async function updateDroitImageAction(token: string, droitImage: boolean) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.membre.update({
        where: { id: membre.id },
        data: { droitImage },
    });

    return { success: true };
}

// ─── Engagement pris connaissance (B6) ───────────────────────────────────────

export async function validerEngagementAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    await prisma.membre.update({
        where: { id: membre.id },
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

    const membre = await findMembreByToken(token);
    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };

    const { url } = await uploadDocumentFile(file, 'documents', type);

    await prisma.$transaction(async (tx) => {
        // Remplacer un document du même type s'il existe déjà
        await tx.document.deleteMany({ where: { membreId: membre.id, type: DocumentType[type] } });
        await tx.document.create({
            data: { membreId: membre.id, type: DocumentType[type], url, name: file.name },
        });
        if (type === 'MEDICAL_CERTIFICATE') {
            await tx.membre.update({ where: { id: membre.id }, data: { certificatMedical: 'declare' } });
        }
    });

    return { success: true, url };
}

// ─── Checkout Stripe ──────────────────────────────────────────────────────────

export async function createCheckoutAction(token: string) {
    if (!token) return { success: false, error: 'Token manquant' };

    const membre = await prisma.membre.findFirst({
        where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
    });

    if (!membre) return { success: false, error: 'Lien invalide ou expiré' };
    if (membre.typePaiement !== 'en_ligne') return { success: false, error: 'Mode de paiement non applicable' };
    if (membre.inscriptionValide) return { success: false, error: 'Inscription déjà validée' };

    // Vérifier que tous les documents requis sont validés
    const documentsRequis = [
        membre.reglementSigne,
        ...(membre.certificatMedicalReq ? [membre.certificatMedical] : []),
        ...(isMineur(membre.dateDeNaissance) ? [membre.autorisationParentale] : []),
    ];
    const tousValides = documentsRequis.every((s) => s === 'valide');
    if (!tousValides) return { success: false, error: 'Documents en attente de validation' };

    if (!membre.montantSnapshot) return { success: false, error: 'Montant introuvable' };

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
    const saison = config?.saison ?? 'en cours';

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    unit_amount: Math.round(Number(membre.montantSnapshot) * 100),
                    product_data: { name: `Inscription ${saison} — Les Gants Méléciens` },
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${token}&paiement=succes`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/mon-dossier?token=${token}&paiement=annule`,
    });

    await prisma.membre.update({
        where: { id: membre.id },
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

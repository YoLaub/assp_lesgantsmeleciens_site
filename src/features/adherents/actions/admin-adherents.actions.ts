'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendDocumentValide, sendDocumentRejete, sendBonCafValide } from '@/shared/lib/mail';

const CHAMPS_ADMIN_AUTORISES = [
    'renouvellement',
    'fnsmr',
    'reglementSigne',
    'certificatMedical',
    'autorisationParentale',
    'couponSport',
    'bonCaf',
    'inscriptionValide',
] as const;

const PatchAdherentSchema = z.object({
    renouvellement: z.boolean().optional(),
    fnsmr: z.boolean().optional(),
    reglementSigne: z.enum(['non_fourni', 'declare', 'valide']).optional(),
    certificatMedical: z.enum(['non_fourni', 'declare', 'valide']).optional(),
    autorisationParentale: z.enum(['non_fourni', 'declare', 'valide']).optional(),
    couponSport: z.enum(['non_fourni', 'declare', 'valide']).optional(),
    bonCaf: z.enum(['non_fourni', 'declare', 'valide']).optional(),
    inscriptionValide: z.boolean().optional(),
});

async function requireAdmin() {
    const { userId } = await auth();
    if (!userId) throw new Error('Non autorisé');
    return userId;
}

export async function getAdherentsAction() {
    await requireAdmin();
    return prisma.membre.findMany({
        where: { statut: { not: 'ESSAYANT' } },
        include: { questionnaire: true },
        orderBy: { dateInscription: 'desc' },
    });
}

export async function getAdherentByIdAction(id: number) {
    await requireAdmin();
    return prisma.membre.findUnique({
        where: { id },
        include: { questionnaire: true, documents: true },
    });
}

export async function patchAdherentAction(id: number, data: z.infer<typeof PatchAdherentSchema>) {
    await requireAdmin();

    const parsed = PatchAdherentSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    // Sécurité : seuls les champs autorisés peuvent être modifiés
    const safeData = Object.fromEntries(
        Object.entries(parsed.data).filter(([key]) =>
            (CHAMPS_ADMIN_AUTORISES as readonly string[]).includes(key)
        )
    );

    await prisma.membre.update({ where: { id }, data: safeData });
    revalidatePath('/admin/club/adherents');
    revalidatePath(`/admin/club/adherents/${id}`);

    return { success: true };
}

const LABELS_DOCUMENTS: Record<string, string> = {
    certificatMedical: 'certificat médical',
    autorisationParentale: 'autorisation parentale',
    reglementSigne: 'règlement intérieur',
    couponSport: 'Pass Sport',
    bonCaf: 'aide CAF',
};

export async function validerDocumentAdminAction(
    id: number,
    field: 'certificatMedical' | 'autorisationParentale' | 'reglementSigne' | 'couponSport' | 'bonCaf',
    statut: 'valide' | 'non_fourni',
) {
    await requireAdmin();

    const membre = await prisma.membre.findUnique({ where: { id }, select: { email: true, prenom: true, bonCaf: true } });
    if (!membre) return { success: false, error: 'Adhérent introuvable' };

    await prisma.membre.update({ where: { id }, data: { [field]: statut } });
    revalidatePath('/admin/club/adherents');
    revalidatePath(`/admin/club/adherents/${id}`);

    const label = LABELS_DOCUMENTS[field] ?? field;

    try {
        if (statut === 'valide') {
            if (field === 'bonCaf') {
                await sendBonCafValide({ email: membre.email, prenom: membre.prenom });
            } else {
                await sendDocumentValide({ email: membre.email, prenom: membre.prenom, labelDocument: label });
            }
        } else {
            await sendDocumentRejete({ email: membre.email, prenom: membre.prenom, labelDocument: label });
        }
    } catch (e) {
        console.error('[validerDocumentAdminAction] email:', e);
    }

    return { success: true };
}

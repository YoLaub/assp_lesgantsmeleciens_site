'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
    return prisma.adherent.findMany({
        include: { questionnaire: true },
        orderBy: { dateInscription: 'desc' },
    });
}

export async function getAdherentByIdAction(id: number) {
    await requireAdmin();
    return prisma.adherent.findUnique({
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

    await prisma.adherent.update({ where: { id }, data: safeData });
    revalidatePath('/admin/club/adherents');
    revalidatePath(`/admin/club/adherents/${id}`);

    return { success: true };
}

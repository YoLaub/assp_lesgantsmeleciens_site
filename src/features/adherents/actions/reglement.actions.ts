'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CONTENU_PAR_DEFAUT = `<p>Le règlement intérieur du club n'a pas encore été configuré. Veuillez contacter l'administrateur.</p>`;

export async function getReglementAction(): Promise<{ contenu: string }> {
    const reglement = await prisma.reglementInterieur.findFirst({ orderBy: { id: 'desc' } });
    return { contenu: reglement?.contenu ?? CONTENU_PAR_DEFAUT };
}

const UpdateReglementSchema = z.object({
    contenu: z.string().min(1, 'Le contenu ne peut pas être vide'),
});

export async function updateReglementAction(data: z.infer<typeof UpdateReglementSchema>) {
    const { userId } = await auth();
    if (!userId) return { success: false as const, error: 'Non autorisé' };

    const parsed = UpdateReglementSchema.safeParse(data);
    if (!parsed.success) return { success: false as const, error: 'Données invalides' };

    const existing = await prisma.reglementInterieur.findFirst({ orderBy: { id: 'desc' } });

    if (existing) {
        await prisma.reglementInterieur.update({
            where: { id: existing.id },
            data: { contenu: parsed.data.contenu, modifiePar: userId },
        });
    } else {
        await prisma.reglementInterieur.create({
            data: { contenu: parsed.data.contenu, modifiePar: userId },
        });
    }

    revalidatePath('/admin/config/reglement');
    return { success: true as const };
}

'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function getConfigTarifsAction() {
    const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
    return config;
}

const UpdateConfigTarifsSchema = z.object({
    saison: z.string().min(1),
    tarifEnfant: z.number().positive(),
    tarifAdos: z.number().positive(),
    tarifAdulte: z.number().positive(),
    supplementOxygene: z.number().min(0),
    deductionCouponSport: z.number().min(0),
});

export async function updateConfigTarifsAction(data: z.infer<typeof UpdateConfigTarifsSchema>) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const parsed = UpdateConfigTarifsSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    const config = await prisma.configTarifs.create({
        data: {
            ...parsed.data,
            modifieLe: new Date(),
            modifiePar: userId,
        },
    });

    revalidatePath('/admin/club/config-tarifs');
    return { success: true, config };
}

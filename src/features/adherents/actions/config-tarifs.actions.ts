'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AdherentRepositoryImpl } from '../data/repositories/adherent.repository.impl';
import { GetConfigTarifsUseCase } from '../domain/usecases/get-config-tarifs.usecase';
import { CreateConfigTarifsUseCase } from '../domain/usecases/create-config-tarifs.usecase';

export async function getConfigTarifsAction() {
    const repo = new AdherentRepositoryImpl();
    const result = await new GetConfigTarifsUseCase(repo).execute();
    if (result.isErr()) return null;
    return result.value;
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

    const repo = new AdherentRepositoryImpl();
    const result = await new CreateConfigTarifsUseCase(repo).execute(parsed.data, userId);
    if (result.isErr()) return { success: false, error: result.error };

    revalidatePath('/admin/club/config-tarifs');
    return { success: true, config: result.value };
}

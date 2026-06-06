'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendDocumentValide, sendDocumentRejete, sendBonCafValide } from '@/shared/lib/mail';
import { AdherentRepositoryImpl } from '../data/repositories/adherent.repository.impl';
import { GetAdherentsUseCase } from '../domain/usecases/get-adherents.usecase';
import { GetAdherentByIdUseCase } from '../domain/usecases/get-adherent-by-id.usecase';
import { PatchAdherentUseCase } from '../domain/usecases/patch-adherent.usecase';
import { ValiderDocumentAdminUseCase } from '../domain/usecases/valider-document-admin.usecase';

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
    const repo = new AdherentRepositoryImpl();
    const result = await new GetAdherentsUseCase(repo).execute();
    if (result.isErr()) throw new Error(result.error);
    return result.value;
}

export async function getAdherentByIdAction(id: number) {
    await requireAdmin();
    const repo = new AdherentRepositoryImpl();
    const result = await new GetAdherentByIdUseCase(repo).execute(id);
    if (result.isErr()) return null;
    return result.value;
}

export async function patchAdherentAction(id: number, data: z.infer<typeof PatchAdherentSchema>) {
    await requireAdmin();

    const parsed = PatchAdherentSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    const repo = new AdherentRepositoryImpl();
    const result = await new PatchAdherentUseCase(repo).execute(id, parsed.data);
    if (result.isErr()) return { success: false, error: result.error };

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

    const repo = new AdherentRepositoryImpl();
    const result = await new ValiderDocumentAdminUseCase(repo).execute(id, field, statut);
    if (result.isErr()) return { success: false, error: result.error };

    revalidatePath('/admin/club/adherents');
    revalidatePath(`/admin/club/adherents/${id}`);

    const { email, prenom } = result.value;
    const label = LABELS_DOCUMENTS[field] ?? field;

    try {
        if (statut === 'valide') {
            if (field === 'bonCaf') {
                await sendBonCafValide({ email, prenom });
            } else {
                await sendDocumentValide({ email, prenom, labelDocument: label });
            }
        } else {
            await sendDocumentRejete({ email, prenom, labelDocument: label });
        }
    } catch (e) {
        console.error('[validerDocumentAdminAction] email:', e);
    }

    return { success: true };
}

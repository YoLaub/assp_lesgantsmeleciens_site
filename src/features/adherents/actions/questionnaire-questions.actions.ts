'use server';

import { prisma } from '@/shared/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type QuestionSante = { code: string; label: string; ordre: number };
export type QuestionSanteEnfant = { code: string; label: string; ordre: number; section: string };

export async function getQuestionsAction(): Promise<QuestionSante[]> {
    return prisma.questionnaireSanteQuestion.findMany({
        orderBy: { ordre: 'asc' },
    });
}

export async function getQuestionsEnfantAction(): Promise<QuestionSanteEnfant[]> {
    return prisma.questionnaireSanteQuestionEnfant.findMany({
        orderBy: { ordre: 'asc' },
    });
}

const UpdateQuestionsSchema = z.array(
    z.object({
        code: z.string(),
        label: z.string().min(10),
    })
);

export async function updateQuestionsAction(
    questions: z.infer<typeof UpdateQuestionsSchema>
): Promise<{ success: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const parsed = UpdateQuestionsSchema.safeParse(questions);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    await prisma.$transaction(
        parsed.data.map(({ code, label }) =>
            prisma.questionnaireSanteQuestion.update({
                where: { code },
                data: { label },
            })
        )
    );

    revalidatePath('/admin/config/sante');
    return { success: true };
}

const UpdateQuestionsEnfantSchema = z.array(
    z.object({
        code: z.string(),
        label: z.string().min(10),
    })
);

export async function updateQuestionsEnfantAction(
    questions: z.infer<typeof UpdateQuestionsEnfantSchema>
): Promise<{ success: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Non autorisé' };

    const parsed = UpdateQuestionsEnfantSchema.safeParse(questions);
    if (!parsed.success) return { success: false, error: 'Données invalides' };

    await prisma.$transaction(
        parsed.data.map(({ code, label }) =>
            prisma.questionnaireSanteQuestionEnfant.update({
                where: { code },
                data: { label },
            })
        )
    );

    revalidatePath('/admin/config/sante');
    return { success: true };
}

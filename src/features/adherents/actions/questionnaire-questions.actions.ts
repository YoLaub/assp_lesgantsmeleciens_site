'use server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function getQuestionsAction() {
  return inscriptionRepository.findQuestionsByType('majeur');
}

export async function getQuestionsEnfantAction() {
  return inscriptionRepository.findQuestionsByType('mineur');
}

const UpdateQuestionsSchema = z.array(z.object({ id: z.number(), label: z.string().min(10) }));

export async function updateQuestionsAction(questions: z.infer<typeof UpdateQuestionsSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Non autorisé' };
  const parsed = UpdateQuestionsSchema.safeParse(questions);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  await inscriptionRepository.updateQuestionsLabels(parsed.data);
  revalidatePath('/admin/config/sante');
  return { success: true };
}

export async function updateQuestionsEnfantAction(questions: z.infer<typeof UpdateQuestionsSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Non autorisé' };
  const parsed = UpdateQuestionsSchema.safeParse(questions);
  if (!parsed.success) return { success: false, error: 'Données invalides' };
  await inscriptionRepository.updateQuestionsLabels(parsed.data);
  revalidatePath('/admin/config/sante');
  return { success: true };
}

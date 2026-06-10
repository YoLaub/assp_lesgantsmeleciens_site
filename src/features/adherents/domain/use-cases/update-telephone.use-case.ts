import { prisma } from '@/shared/lib/prisma';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function updateTelephoneUseCase(inscription: { id: number; membreId: string }, telephone1: string, telephone2?: string) {
  await prisma.membre.update({ where: { id: inscription.membreId }, data: { telephone: telephone1 } });
  await inscriptionRepository.update(inscription.id, { telephone2: telephone2 ?? null });
}

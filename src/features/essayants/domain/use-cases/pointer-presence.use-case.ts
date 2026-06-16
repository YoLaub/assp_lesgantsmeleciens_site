import { prisma } from '@/shared/lib/prisma';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function pointerPresenceUseCase(inscriptionId: number, nomCoach: string) {
  const inscription = await inscriptionRepository.findById(inscriptionId);
  if (!inscription || inscription.statut !== 'ESSAYANT') {
    return { success: false, error: 'Essayant introuvable' as const };
  }
  if (inscription.accesBloque) {
    return { success: false, error: 'Accès bloqué — 3 cours déjà effectués' as const };
  }

  const nouvPresences = inscription.nombrePresences + 1;
  const bloque = nouvPresences >= 3;

  await inscriptionRepository.createPresence(inscriptionId, nomCoach);

  const updateData: Record<string, unknown> = {
    nombrePresences: nouvPresences,
    accesBloque: bloque,
  };

  if (bloque) {
    const newToken = crypto.randomUUID();
    const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.membre.update({
      where: { id: inscription.membre.id },
      data: { accesToken: newToken, accesTokenExpireLe: expireLe },
    });
    updateData._newToken = newToken;
  }

  await inscriptionRepository.update(inscriptionId, updateData as Partial<import('@/features/adhesion/domain/models/inscription.model').Inscription>);

  return {
    success: true as const,
    nouvPresences,
    bloque,
    membre: { email: inscription.membre.email, prenom: inscription.membre.prenom, numeroAdherent: inscription.membre.numeroAdherent },
  };
}

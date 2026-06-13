import { membreRepository } from '@/features/adhesion/data/repositories/membre.repository.impl';
import { hashToken } from '@/shared/lib/token';

export async function requestAccesEssaiUseCase(email: string, numeroAdherent: string) {
  const membre = await membreRepository.findByEmailAndNumero(email, numeroAdherent);
  if (!membre) return null;

  const token = crypto.randomUUID();
  const expireLe = new Date(Date.now() + 60 * 60 * 1000);
  await membreRepository.updateToken(membre.id, hashToken(token), expireLe);

  return { email: membre.email, prenom: membre.prenom, token };
}

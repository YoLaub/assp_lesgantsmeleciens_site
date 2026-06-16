import { membreRepository } from '@/features/adhesion/data/repositories/membre.repository.impl';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import { hashToken } from '@/shared/lib/token';

export interface CreateEssayantInput {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateDeNaissance: Date;
}

export async function createEssayantUseCase(input: CreateEssayantInput) {
  const numeroAdherent = await membreRepository.generateUniqueNumero();
  const accesToken = crypto.randomUUID();
  const accesTokenExpireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const saison = await inscriptionRepository.getCurrentSaison();

  const membre = await membreRepository.create({
    nom: input.nom,
    prenom: input.prenom,
    email: input.email,
    telephone: input.telephone,
    dateDeNaissance: input.dateDeNaissance,
    numeroAdherent,
    accesToken: hashToken(accesToken),
    accesTokenExpireLe,
  });

  await inscriptionRepository.create({
    statut: 'ESSAYANT',
    saison,
    membreId: membre.id,
  });

  return { membre, numeroAdherent, accesToken };
}

import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function getMonEssaiUseCase(token: string) {
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription || inscription.statut !== 'ESSAYANT') return null;

  return {
    inscriptionId: inscription.id,
    id: inscription.membre.id,
    numeroAdherent: inscription.membre.numeroAdherent,
    nom: inscription.membre.nom,
    prenom: inscription.membre.prenom,
    nombrePresences: inscription.nombrePresences,
    accesBloque: inscription.accesBloque,
    accesToken: inscription.membre.accesToken,
  };
}

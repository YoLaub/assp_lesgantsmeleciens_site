import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function getEssayantsForCoachUseCase() {
  const inscriptions = await inscriptionRepository.findAllEssayants();
  return inscriptions.map((i) => ({
    id: i.id,
    membreId: i.membre.id,
    numeroAdherent: i.membre.numeroAdherent,
    nom: i.membre.nom,
    prenom: i.membre.prenom,
    nombrePresences: i.nombrePresences,
    accesBloque: i.accesBloque,
    presences: (i as { presences?: { pointeLe: Date }[] }).presences ?? [],
  }));
}

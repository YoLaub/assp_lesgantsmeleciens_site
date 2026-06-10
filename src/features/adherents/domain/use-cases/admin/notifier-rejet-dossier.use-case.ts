import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
export async function notifierRejetDossierUseCase(id: number) {
  const inscription = await inscriptionRepository.findAdherentById(id);
  if (!inscription) throw new Error('Adhérent introuvable');
  return { email: inscription.membre.email, prenom: inscription.membre.prenom };
}

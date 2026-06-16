import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function getEssayantConversionDataUseCase(token: string) {
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription || inscription.statut !== 'ESSAYANT') return null;

  const m = inscription.membre;
  return {
    inscriptionId: inscription.id,
    membreId: m.id,
    nom: m.nom,
    prenom: m.prenom,
    email: m.email,
    telephone: m.telephone ?? '',
    dateDeNaissance: m.dateDeNaissance.toISOString().split('T')[0],
    numeroAdherent: m.numeroAdherent,
  };
}

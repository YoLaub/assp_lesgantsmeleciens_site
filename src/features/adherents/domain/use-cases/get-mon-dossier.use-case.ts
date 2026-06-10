import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function getMonDossierUseCase(token: string) {
  const inscription = await inscriptionRepository.findByToken(token);
  if (!inscription) return null;

  const m = inscription.membre;
  const q = inscription.questionnaire;

  const reponseMap: Record<string, boolean> = {};
  if (q) {
    q.reponses.forEach((r, i) => { reponseMap[`q${i + 1}`] = r.reponse ?? false; });
  }

  return {
    inscriptionId: inscription.id,
    id: m.id,
    numeroAdherent: m.numeroAdherent,
    nom: m.nom,
    prenom: m.prenom,
    email: m.email,
    categorie: inscription.categorie,
    dateDeNaissance: m.dateDeNaissance,
    telephone1: m.telephone,
    telephone2: inscription.telephone2,
    oxygene: inscription.oxygene,
    reglementSigne: inscription.reglementSigne,
    certificatMedical: inscription.certificatMedical,
    certificatMedicalReq: inscription.certificatMedicalReq,
    autorisationParentale: inscription.autorisationParentale,
    couponSport: inscription.couponSport,
    bonCaf: inscription.bonCaf,
    droitImage: inscription.droitImage,
    engagementPrisConnaissance: inscription.engagementPrisConnaissance,
    documents: inscription.documents.map((d) => ({ id: d.id, type: d.type, url: d.url, name: d.name })),
    montantSnapshot: inscription.montantSnapshot,
    typePaiement: inscription.typePaiement,
    inscriptionValide: inscription.inscriptionValide,
    stripeSessionId: inscription.stripeSessionId,
    questionnaire: q ? reponseMap : null,
    questionnaireEnfantRempli: q?.type === 'mineur',
  };
}

// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindByToken = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { findByToken: mockFindByToken },
}));

import { getMonDossierUseCase } from './get-mon-dossier.use-case';

const inscription = (over: Record<string, unknown> = {}) => ({
  id: 1,
  categorie: 'adulte',
  telephone2: null,
  oxygene: false,
  reglementSigne: 'declare',
  certificatMedical: 'non_fourni',
  certificatMedicalReq: false,
  autorisationSortieSeul: null,
  couponSport: 'non_fourni',
  bonCaf: 'non_fourni',
  droitImage: false,
  engagementPrisConnaissance: false,
  documents: [{ id: 'd1', type: 'ID_PHOTO', url: 'http://x', name: null }],
  montantSnapshot: 140,
  typePaiement: 'en_ligne',
  inscriptionValide: false,
  stripeSessionId: null,
  questionnaire: null,
  membre: {
    id: 'm-1', numeroAdherent: 'ADH-1', nom: 'Test', prenom: 'Alice', email: 'a@test.fr',
    adresse: '1 rue X', codePostal: '59000', communeNom: 'Lille', dateDeNaissance: new Date('2000-01-01'), telephone: '06',
  },
  ...over,
});

describe('getMonDossierUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne null si le token ne correspond à rien', async () => {
    mockFindByToken.mockResolvedValue(null);
    expect(await getMonDossierUseCase('tok')).toBeNull();
  });

  it('mappe le dossier complet', async () => {
    mockFindByToken.mockResolvedValue(inscription());
    const res = await getMonDossierUseCase('tok');
    expect(res).toMatchObject({
      inscriptionId: 1, numeroAdherent: 'ADH-1', prenom: 'Alice',
      ville: 'Lille', autorisationSortieSeul: null, questionnaire: null, questionnaireEnfantRempli: false,
    });
  });

  it('reconstruit les réponses du questionnaire et détecte le type enfant', async () => {
    mockFindByToken.mockResolvedValue(inscription({
      questionnaire: { type: 'mineur', reponses: [{ reponse: true }, { reponse: false }, { reponse: null }] },
    }));
    const res = await getMonDossierUseCase('tok');
    expect(res?.questionnaire).toEqual({ q1: true, q2: false, q3: false });
    expect(res?.questionnaireEnfantRempli).toBe(true);
  });
});

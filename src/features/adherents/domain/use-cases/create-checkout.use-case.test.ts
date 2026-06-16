// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindByToken = vi.hoisted(() => vi.fn());
const mockGetSaison = vi.hoisted(() => vi.fn().mockResolvedValue('2025-2026'));
const mockUpdate = vi.hoisted(() => vi.fn());
const mockCreateSession = vi.hoisted(() => vi.fn());

vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: {
    findByToken: mockFindByToken,
    getCurrentSaison: mockGetSaison,
    update: mockUpdate,
  },
}));
vi.mock('stripe', () => ({
  default: class {
    checkout = { sessions: { create: mockCreateSession } };
  },
}));

import { createCheckoutUseCase } from './create-checkout.use-case';

// Adhérent majeur, dossier complet prêt à payer en ligne.
function inscriptionValide(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    typePaiement: 'en_ligne',
    inscriptionValide: false,
    montantSnapshot: 140,
    reglementSigne: 'declare',
    certificatMedicalReq: false,
    certificatMedical: 'non_fourni',
    autorisationSortieSeul: null,
    membre: { dateDeNaissance: new Date('1990-01-01') },
    ...overrides,
  };
}

describe('createCheckoutUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    mockCreateSession.mockResolvedValue({ id: 'cs_123', url: 'https://stripe/checkout' });
  });

  it('crée une session Stripe et enregistre le sessionId (cas nominal)', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide());
    const url = await createCheckoutUseCase('tok', 'https://app');
    expect(url).toBe('https://stripe/checkout');
    expect(mockUpdate).toHaveBeenCalledWith(1, { stripeSessionId: 'cs_123' });
  });

  it('échoue si le lien est invalide', async () => {
    mockFindByToken.mockResolvedValue(null);
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('Lien invalide');
  });

  it('échoue si l\'inscription est déjà validée', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({ inscriptionValide: true }));
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('déjà validée');
  });

  it('échoue si le montant est introuvable', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({ montantSnapshot: null }));
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('Montant introuvable');
  });

  it('échoue si le mode de paiement n\'est pas en ligne', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({ typePaiement: 'sur_place' }));
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('Mode de paiement');
  });

  it('échoue si le règlement n\'est pas signé', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({ reglementSigne: 'non_fourni' }));
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('Règlement non signé');
  });

  it('échoue si le certificat requis n\'est pas validé', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({ certificatMedicalReq: true, certificatMedical: 'declare' }));
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('Certificat médical');
  });

  it('accepte un règlement signé non "valide" (état final)', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({ reglementSigne: 'declare' }));
    await expect(createCheckoutUseCase('tok', 'https://app')).resolves.toBe('https://stripe/checkout');
  });

  it('échoue pour un mineur sans réponse à l\'autorisation de sortie', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({
      membre: { dateDeNaissance: new Date(new Date().getFullYear() - 10, 0, 1) },
      autorisationSortieSeul: null,
    }));
    await expect(createCheckoutUseCase('tok', 'https://app')).rejects.toThrow('Autorisation de sortie');
  });

  it('accepte un mineur ayant répondu (même "non autorisé")', async () => {
    mockFindByToken.mockResolvedValue(inscriptionValide({
      membre: { dateDeNaissance: new Date(new Date().getFullYear() - 10, 0, 1) },
      autorisationSortieSeul: false,
    }));
    await expect(createCheckoutUseCase('tok', 'https://app')).resolves.toBe('https://stripe/checkout');
  });
});

// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindById = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { findAdherentById: mockFindById },
}));

import { notifierRejetDossierUseCase } from './notifier-rejet-dossier.use-case';

describe('notifierRejetDossierUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne le contact de l\'adhérent', async () => {
    mockFindById.mockResolvedValue({ membre: { email: 'b@test.fr', prenom: 'Bob' } });
    const res = await notifierRejetDossierUseCase(1);
    expect(res).toEqual({ email: 'b@test.fr', prenom: 'Bob' });
  });

  it('lève une erreur si l\'adhérent est introuvable', async () => {
    mockFindById.mockResolvedValue(null);
    await expect(notifierRejetDossierUseCase(99)).rejects.toThrow('Adhérent introuvable');
  });
});

// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
const mockFindById = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate, findAdherentById: mockFindById },
}));

import { validerDocumentUseCase } from './valider-document.use-case';

describe('validerDocumentUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('met à jour le document puis retourne le contact adhérent', async () => {
    mockFindById.mockResolvedValue({ membre: { email: 'a@test.fr', prenom: 'Alice' } });
    const res = await validerDocumentUseCase(1, 'certificatMedical', 'valide');
    expect(mockUpdate).toHaveBeenCalledWith(1, { certificatMedical: 'valide' });
    expect(res).toEqual({ email: 'a@test.fr', prenom: 'Alice' });
  });

  it('retourne des contacts undefined si l\'adhérent est introuvable', async () => {
    mockFindById.mockResolvedValue(null);
    const res = await validerDocumentUseCase(2, 'bonCaf', 'non_fourni');
    expect(res).toEqual({ email: undefined, prenom: undefined });
  });
});

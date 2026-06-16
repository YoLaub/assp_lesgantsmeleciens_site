// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindByToken = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { findByToken: mockFindByToken },
}));

import { getEssayantConversionDataUseCase } from './get-essayant-conversion-data.use-case';

describe('getEssayantConversionDataUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne null si non ESSAYANT', async () => {
    mockFindByToken.mockResolvedValue({ statut: 'ACTIF', membre: {} });
    expect(await getEssayantConversionDataUseCase('tok')).toBeNull();
  });

  it('mappe les données de pré-remplissage avec date ISO courte', async () => {
    mockFindByToken.mockResolvedValue({
      id: 1, statut: 'ESSAYANT',
      membre: { id: 'm-1', nom: 'Test', prenom: 'Alice', email: 'a@t.fr', telephone: null, dateDeNaissance: new Date('2010-05-03T00:00:00Z'), numeroAdherent: 'ADH-1' },
    });
    const res = await getEssayantConversionDataUseCase('tok');
    expect(res).toEqual({
      inscriptionId: 1, membreId: 'm-1', nom: 'Test', prenom: 'Alice',
      email: 'a@t.fr', telephone: '', dateDeNaissance: '2010-05-03', numeroAdherent: 'ADH-1',
    });
  });
});

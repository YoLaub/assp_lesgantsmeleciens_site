// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockCommuneUpsert = vi.hoisted(() => vi.fn());
const mockMembreUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    commune: { upsert: mockCommuneUpsert },
    membre: { update: mockMembreUpdate },
  },
}));

import { updateAdresseUseCase } from './update-adresse.use-case';

describe('updateAdresseUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upsert la commune puis met à jour le membre', async () => {
    await updateAdresseUseCase('membre-1', {
      adresse: '10 rue de la Paix',
      codePostal: '59000',
      codeInsee: '59350',
      communeNom: 'Lille',
    });

    expect(mockCommuneUpsert).toHaveBeenCalledWith({
      where: { codeInsee: '59350' },
      update: { nom: 'Lille' },
      create: { codeInsee: '59350', nom: 'Lille' },
    });
    expect(mockMembreUpdate).toHaveBeenCalledWith({
      where: { id: 'membre-1' },
      data: { adresse: '10 rue de la Paix', codePostal: '59000', codeInsee: '59350' },
    });
  });
});

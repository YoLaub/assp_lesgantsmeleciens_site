// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate },
}));

import { setTypePaiementUseCase } from './set-type-paiement.use-case';

describe('setTypePaiementUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enregistre le mode de paiement choisi', async () => {
    await setTypePaiementUseCase(7, 'en_ligne');
    expect(mockUpdate).toHaveBeenCalledWith(7, { typePaiement: 'en_ligne' });
  });

  it('accepte le paiement sur place', async () => {
    await setTypePaiementUseCase(8, 'sur_place');
    expect(mockUpdate).toHaveBeenCalledWith(8, { typePaiement: 'sur_place' });
  });
});

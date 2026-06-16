// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate },
}));

import { signerReglementUseCase } from './signer-reglement.use-case';

describe('signerReglementUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it("passe le règlement à l'état 'declare'", async () => {
    await signerReglementUseCase(42);
    expect(mockUpdate).toHaveBeenCalledWith(42, { reglementSigne: 'declare' });
  });
});

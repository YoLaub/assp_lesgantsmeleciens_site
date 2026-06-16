// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate },
}));

import { patchAutorisationSortieUseCase } from './patch-autorisation-sortie.use-case';

describe('patchAutorisationSortieUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('enregistre une autorisation de sortie accordée', async () => {
    await patchAutorisationSortieUseCase(10, true);
    expect(mockUpdate).toHaveBeenCalledWith(10, { autorisationSortieSeul: true });
  });

  it('enregistre un refus de sortie (état final, pas non_fourni)', async () => {
    await patchAutorisationSortieUseCase(11, false);
    expect(mockUpdate).toHaveBeenCalledWith(11, { autorisationSortieSeul: false });
  });
});

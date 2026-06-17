// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate },
}));

import { updateDroitImageUseCase } from './update-droit-image.use-case';

describe('updateDroitImageUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it("enregistre l'autorisation du droit à l'image", async () => {
    await updateDroitImageUseCase(5, true);
    expect(mockUpdate).toHaveBeenCalledWith(5, { droitImage: true });
  });

  it('enregistre le refus du droit à l\'image', async () => {
    await updateDroitImageUseCase(6, false);
    expect(mockUpdate).toHaveBeenCalledWith(6, { droitImage: false });
  });
});

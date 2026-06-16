// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate },
}));

import { validerEngagementUseCase } from './valider-engagement.use-case';

describe('validerEngagementUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it("marque l'engagement comme pris connaissance", async () => {
    await validerEngagementUseCase(3);
    expect(mockUpdate).toHaveBeenCalledWith(3, { engagementPrisConnaissance: true });
  });
});

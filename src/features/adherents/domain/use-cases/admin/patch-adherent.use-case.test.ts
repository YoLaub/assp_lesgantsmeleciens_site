// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockUpdate },
}));

import { patchAdherentUseCase } from './patch-adherent.use-case';

describe('patchAdherentUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('laisse passer les champs autorisés', async () => {
    await patchAdherentUseCase(1, { reglementSigne: 'valide', inscriptionValide: true });
    expect(mockUpdate).toHaveBeenCalledWith(1, { reglementSigne: 'valide', inscriptionValide: true });
  });

  it('filtre les champs non autorisés (anti mass-assignment)', async () => {
    // montantSnapshot et membreId sont typables mais hors liste blanche : ignorés.
    await patchAdherentUseCase(2, { bonCaf: 'valide', montantSnapshot: 9999, membreId: 'pirate' });
    expect(mockUpdate).toHaveBeenCalledWith(2, { bonCaf: 'valide' });
  });

  it('appelle update avec un objet vide si aucun champ autorisé', async () => {
    await patchAdherentUseCase(3, { montantSnapshot: 1, stripeSessionId: 'x' });
    expect(mockUpdate).toHaveBeenCalledWith(3, {});
  });
});

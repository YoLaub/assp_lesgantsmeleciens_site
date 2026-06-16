// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindAll = vi.hoisted(() => vi.fn());
const mockFindById = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { findAllAdherents: mockFindAll, findAdherentById: mockFindById },
}));

import { getAdherentsUseCase } from './get-adherents.use-case';
import { getAdherentByIdUseCase } from './get-adherent-by-id.use-case';

describe('getAdherentsUseCase / getAdherentByIdUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('liste tous les adhérents', async () => {
    mockFindAll.mockResolvedValue([{ id: 1 }]);
    expect(await getAdherentsUseCase()).toEqual([{ id: 1 }]);
    expect(mockFindAll).toHaveBeenCalled();
  });

  it('récupère un adhérent par id', async () => {
    mockFindById.mockResolvedValue({ id: 7 });
    expect(await getAdherentByIdUseCase(7)).toEqual({ id: 7 });
    expect(mockFindById).toHaveBeenCalledWith(7);
  });
});

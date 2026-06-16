// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const repo = vi.hoisted(() => ({ getAllActive: vi.fn() }));
vi.mock('@/features/disciplines/data/repositories/discipline.repository.impl', () => ({
  DisciplineRepositoryImpl: class { constructor() { return repo; } },
}));

import { getActiveDisciplinesAction } from './discipline.actions';

beforeEach(() => { vi.clearAllMocks(); vi.spyOn(console, 'error').mockImplementation(() => {}); });

describe('getActiveDisciplinesAction (front)', () => {
  it('retourne les disciplines actives', async () => {
    repo.getAllActive.mockResolvedValue([{ id: '1' }]);
    expect(await getActiveDisciplinesAction()).toEqual({ success: true, data: [{ id: '1' }] });
  });
  it('renvoie un tableau vide si la BDD plante', async () => {
    repo.getAllActive.mockRejectedValue(new Error('ETIMEDOUT'));
    expect(await getActiveDisciplinesAction()).toMatchObject({ success: false, data: [] });
  });
});

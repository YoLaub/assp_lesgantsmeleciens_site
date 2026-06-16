// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const repo = vi.hoisted(() => ({ getAllActive: vi.fn(), getById: vi.fn(), getFeatured: vi.fn() }));
vi.mock('@/features/actualites/data/repositories/actualite.repository.impl', () => ({
  ActualiteRepositoryImpl: class { constructor() { return repo; } },
}));

import { getActiveActualitesAction, getActualiteAction, getFeaturedActualiteAction } from './actualite.actions';

beforeEach(() => { vi.clearAllMocks(); vi.spyOn(console, 'error').mockImplementation(() => {}); });

describe('actions actualités (front)', () => {
  it('getActiveActualitesAction retourne les actives', async () => {
    repo.getAllActive.mockResolvedValue([{ id: '1' }]);
    expect(await getActiveActualitesAction()).toEqual({ success: true, data: [{ id: '1' }] });
  });
  it('getActiveActualitesAction renvoie un tableau vide en cas d\'erreur', async () => {
    repo.getAllActive.mockRejectedValue(new Error('db'));
    expect(await getActiveActualitesAction()).toMatchObject({ success: false, data: [] });
  });
  it('getActualiteAction retourne une actualité', async () => {
    repo.getById.mockResolvedValue({ id: '9' });
    expect(await getActualiteAction('9')).toEqual({ success: true, data: { id: '9' } });
  });
  it('getActualiteAction gère l\'erreur', async () => {
    repo.getById.mockRejectedValue(new Error('db'));
    expect(await getActualiteAction('9')).toMatchObject({ success: false, data: null });
  });
  it('getFeaturedActualiteAction retourne la vedette', async () => {
    repo.getFeatured.mockResolvedValue({ id: 'f' });
    expect(await getFeaturedActualiteAction()).toEqual({ success: true, data: { id: 'f' } });
  });
  it('getFeaturedActualiteAction gère l\'erreur', async () => {
    repo.getFeatured.mockRejectedValue(new Error('db'));
    expect(await getFeaturedActualiteAction()).toMatchObject({ success: false });
  });
});

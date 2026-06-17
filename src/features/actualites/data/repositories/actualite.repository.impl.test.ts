// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const ds = vi.hoisted(() => ({
  upsertActualite: vi.fn(),
  getActualites: vi.fn(),
  getActualiteById: vi.fn(),
  deleteActualite: vi.fn(),
  getActiveActualites: vi.fn(),
  getFeaturedActualite: vi.fn(),
  reorderActualites: vi.fn(),
}));
vi.mock('../datasources/actualite.postgres.datasource', () => ({
  ActualitePostgresDataSource: class { constructor() { return ds; } },
}));

import { ActualiteRepositoryImpl } from './actualite.repository.impl';
import type { Actualite } from '../../domain/models/actualite.model';

const actu = { id: '1', title: 'T' } as Actualite;

describe('ActualiteRepositoryImpl (délégation au datasource)', () => {
  const repo = new ActualiteRepositoryImpl();
  beforeEach(() => vi.clearAllMocks());

  it('save → upsertActualite', async () => { await repo.save(actu); expect(ds.upsertActualite).toHaveBeenCalledWith(actu); });
  it('getAll → getActualites', async () => { await repo.getAll(); expect(ds.getActualites).toHaveBeenCalled(); });
  it('getById → getActualiteById', async () => { await repo.getById('1'); expect(ds.getActualiteById).toHaveBeenCalledWith('1'); });
  it('delete → deleteActualite', async () => { await repo.delete('1'); expect(ds.deleteActualite).toHaveBeenCalledWith('1'); });
  it('getAllActive → getActiveActualites', async () => { await repo.getAllActive(); expect(ds.getActiveActualites).toHaveBeenCalled(); });
  it('getFeatured → getFeaturedActualite', async () => { await repo.getFeatured(); expect(ds.getFeaturedActualite).toHaveBeenCalled(); });
  it('reorderMany → reorderActualites', async () => {
    const items = [{ id: '1', order: 1 }];
    await repo.reorderMany(items);
    expect(ds.reorderActualites).toHaveBeenCalledWith(items);
  });
});

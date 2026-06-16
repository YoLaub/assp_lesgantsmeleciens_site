// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const ds = vi.hoisted(() => ({
  upsertDiscipline: vi.fn(),
  getDisciplines: vi.fn(),
  getDisciplineById: vi.fn(),
  getActiveDisciplines: vi.fn(),
  reorderDisciplines: vi.fn(),
}));
vi.mock('../datasources/discipline.postgres.datasource', () => ({
  DisciplinePostgresDataSource: class { constructor() { return ds; } },
}));

import { DisciplineRepositoryImpl } from './discipline.repository.impl';
import type { Discipline } from '../../domain/models/discipline.model';

const disc = { id: '1', title: 'T' } as Discipline;

describe('DisciplineRepositoryImpl (délégation au datasource)', () => {
  const repo = new DisciplineRepositoryImpl();
  beforeEach(() => vi.clearAllMocks());

  it('save → upsertDiscipline', async () => { await repo.save(disc); expect(ds.upsertDiscipline).toHaveBeenCalledWith(disc); });
  it('getAll → getDisciplines', async () => { await repo.getAll(); expect(ds.getDisciplines).toHaveBeenCalled(); });
  it('getById → getDisciplineById', async () => { await repo.getById('1'); expect(ds.getDisciplineById).toHaveBeenCalledWith('1'); });
  it('delete ne lève pas (non implémenté)', async () => { await expect(repo.delete('1')).resolves.toBeUndefined(); });
  it('getAllActive → getActiveDisciplines', async () => { await repo.getAllActive(); expect(ds.getActiveDisciplines).toHaveBeenCalled(); });
  it('reorderMany → reorderDisciplines', async () => {
    const items = [{ id: '1', order: 1 }];
    await repo.reorderMany(items);
    expect(ds.reorderDisciplines).toHaveBeenCalledWith(items);
  });
});

// @vitest-environment node
import { vi, describe, it, expect } from 'vitest';
import type { DisciplineRepository } from '../repositories/discipline.repository';
import type { Discipline } from '../models/discipline.model';
import { GetActiveDisciplinesUseCase } from './get-active-disciplines.usecase';
import { GetAllDisciplinesUseCase } from './getAll-discipline.usecase';
import { GetDisciplineUseCase } from './get-discipline.usecase';
import { SaveDisciplineUseCase } from './save-discipline.usecase';
import { ReorderDisciplinesUseCase } from './reorder-disciplines.usecase';

function mockRepo(): DisciplineRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    getAllActive: vi.fn(),
    reorderMany: vi.fn(),
  };
}

const disc = (over: Partial<Discipline> = {}) => ({ id: '1', title: 'Boxe anglaise', ...over }) as Discipline;

describe('Discipline use-cases', () => {
  it('GetActive délègue à getAllActive', async () => {
    const repo = mockRepo();
    (repo.getAllActive as ReturnType<typeof vi.fn>).mockResolvedValue([disc()]);
    const res = await new GetActiveDisciplinesUseCase(repo).execute();
    expect(res).toHaveLength(1);
  });

  it('GetAll délègue à getAll', async () => {
    const repo = mockRepo();
    (repo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await new GetAllDisciplinesUseCase(repo).execute();
    expect(repo.getAll).toHaveBeenCalled();
  });

  it('GetDiscipline délègue à getById', async () => {
    const repo = mockRepo();
    (repo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(disc());
    const res = await new GetDisciplineUseCase(repo).execute('1');
    expect(res?.id).toBe('1');
    expect(repo.getById).toHaveBeenCalledWith('1');
  });

  it('Save enregistre une discipline au titre valide', async () => {
    const repo = mockRepo();
    await new SaveDisciplineUseCase(repo).execute(disc({ title: 'Muay Thaï' }));
    expect(repo.save).toHaveBeenCalled();
  });

  it('Save rejette un titre trop court', async () => {
    const repo = mockRepo();
    await expect(new SaveDisciplineUseCase(repo).execute(disc({ title: 'ab' }))).rejects.toThrow('trop court');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('Reorder ne fait rien sur une liste vide', async () => {
    const repo = mockRepo();
    await new ReorderDisciplinesUseCase(repo).execute([]);
    expect(repo.reorderMany).not.toHaveBeenCalled();
  });

  it('Reorder délègue à reorderMany sinon', async () => {
    const repo = mockRepo();
    const items = [{ id: '1', order: 1 }];
    await new ReorderDisciplinesUseCase(repo).execute(items);
    expect(repo.reorderMany).toHaveBeenCalledWith(items);
  });
});

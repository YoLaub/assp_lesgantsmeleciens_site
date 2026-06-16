// @vitest-environment node
import { vi, describe, it, expect } from 'vitest';
import type { ActualiteRepository } from '../repositories/actualite.repository';
import type { Actualite } from '../models/actualite.model';
import { GetActiveActualitesUseCase } from './get-active-actualites.usecase';
import { GetAllActualitesUseCase } from './getAll-actualite.usecase';
import { GetActualiteUseCase } from './get-actualite.usecase';
import { GetFeaturedActualiteUseCase } from './get-featured-actualite.usecase';
import { SaveActualiteUseCase } from './save-actualite.usecase';
import { ReorderActualitesUseCase } from './reorder-actualites.usecase';

function mockRepo(): ActualiteRepository {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    getAllActive: vi.fn(),
    getFeatured: vi.fn(),
    reorderMany: vi.fn(),
  };
}

const actu = (over: Partial<Actualite> = {}) => ({ id: '1', title: 'Titre valide', ...over }) as Actualite;

describe('Actualite use-cases', () => {
  it('GetActive délègue à getAllActive', async () => {
    const repo = mockRepo();
    (repo.getAllActive as ReturnType<typeof vi.fn>).mockResolvedValue([actu()]);
    const res = await new GetActiveActualitesUseCase(repo).execute();
    expect(res).toHaveLength(1);
    expect(repo.getAllActive).toHaveBeenCalled();
  });

  it('GetAll délègue à getAll', async () => {
    const repo = mockRepo();
    (repo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await new GetAllActualitesUseCase(repo).execute();
    expect(repo.getAll).toHaveBeenCalled();
  });

  it('GetActualite délègue à getById', async () => {
    const repo = mockRepo();
    (repo.getById as ReturnType<typeof vi.fn>).mockResolvedValue(actu());
    const res = await new GetActualiteUseCase(repo).execute('1');
    expect(res?.id).toBe('1');
    expect(repo.getById).toHaveBeenCalledWith('1');
  });

  it('GetFeatured délègue à getFeatured', async () => {
    const repo = mockRepo();
    (repo.getFeatured as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await new GetFeaturedActualiteUseCase(repo).execute();
    expect(res).toBeNull();
  });

  it('Save enregistre une actualité au titre valide', async () => {
    const repo = mockRepo();
    await new SaveActualiteUseCase(repo).execute(actu({ title: 'Mon actu' }));
    expect(repo.save).toHaveBeenCalled();
  });

  it('Save rejette un titre trop court', async () => {
    const repo = mockRepo();
    await expect(new SaveActualiteUseCase(repo).execute(actu({ title: 'ab' }))).rejects.toThrow('trop court');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('Reorder ne fait rien sur une liste vide', async () => {
    const repo = mockRepo();
    await new ReorderActualitesUseCase(repo).execute([]);
    expect(repo.reorderMany).not.toHaveBeenCalled();
  });

  it('Reorder délègue à reorderMany sinon', async () => {
    const repo = mockRepo();
    const items = [{ id: '1', order: 2 }, { id: '2', order: 1 }];
    await new ReorderActualitesUseCase(repo).execute(items);
    expect(repo.reorderMany).toHaveBeenCalledWith(items);
  });
});

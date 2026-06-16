// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const discRepo = vi.hoisted(() => ({ save: vi.fn(), getById: vi.fn(), getAll: vi.fn(), reorderMany: vi.fn() }));
const actuRepo = vi.hoisted(() => ({ save: vi.fn(), getById: vi.fn(), getAll: vi.fn(), reorderMany: vi.fn() }));
const mockUpload = vi.hoisted(() => vi.fn());

vi.mock('@/features/disciplines/data/repositories/discipline.repository.impl', () => ({
  DisciplineRepositoryImpl: class { constructor() { return discRepo; } },
}));
vi.mock('@/features/actualites/data/repositories/actualite.repository.impl', () => ({
  ActualiteRepositoryImpl: class { constructor() { return actuRepo; } },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/shared/lib/upload', () => ({ uploadPublicImage: mockUpload }));

import {
  saveDisciplineAction, getDisciplineByIdAction, getAllDisciplinesAction, reorderDisciplinesAction,
  saveActualiteAction, getActualiteByIdAction, getAllActualitesAction, reorderActualitesAction,
  uploadPhotoAction, uploadActualitePhotoAction,
} from './actions';

const fakeImage = (over: Partial<File> = {}) => ({ name: 'p.jpg', size: 1000, type: 'image/jpeg', ...over } as File);
const fd = (file: File | null) => ({ get: () => file } as unknown as FormData);

beforeEach(() => {
  vi.clearAllMocks();
  mockUpload.mockResolvedValue({ blurDataUrl: 'blur', publicId: 'pid', version: 1, format: 'jpg', width: 10, height: 10 });
});

describe('actions disciplines/actualités', () => {
  it('saveDisciplineAction enregistre un titre valide', async () => {
    expect(await saveDisciplineAction({ title: 'Boxe', description: '<p>x</p>' } as never)).toEqual({ success: true });
    expect(discRepo.save).toHaveBeenCalled();
  });

  it('saveDisciplineAction renvoie l\'erreur du use-case (titre court)', async () => {
    const res = await saveDisciplineAction({ title: 'ab', description: '' } as never);
    expect(res.success).toBe(false);
    expect(discRepo.save).not.toHaveBeenCalled();
  });

  it('getDisciplineByIdAction retourne la discipline', async () => {
    discRepo.getById.mockResolvedValue({ id: '1' });
    expect(await getDisciplineByIdAction('1')).toEqual({ success: true, discipline: { id: '1' } });
  });

  it('getDisciplineByIdAction capture une erreur', async () => {
    discRepo.getById.mockRejectedValue(new Error('boom'));
    expect(await getDisciplineByIdAction('1')).toEqual({ success: false, error: 'boom' });
  });

  it('getAllDisciplinesAction liste les disciplines', async () => {
    discRepo.getAll.mockResolvedValue([]);
    expect(await getAllDisciplinesAction()).toEqual({ success: true, disciplines: [] });
  });

  it('reorderDisciplinesAction réordonne', async () => {
    expect(await reorderDisciplinesAction([{ id: '1', order: 1 }])).toEqual({ success: true });
    expect(discRepo.reorderMany).toHaveBeenCalled();
  });

  it('saveActualiteAction enregistre + revalide', async () => {
    expect(await saveActualiteAction({ title: 'Actu', description: '<p>x</p>' } as never)).toEqual({ success: true });
    expect(actuRepo.save).toHaveBeenCalled();
  });

  it('getActualiteByIdAction retourne l\'actualité', async () => {
    actuRepo.getById.mockResolvedValue({ id: '9' });
    expect(await getActualiteByIdAction('9')).toEqual({ success: true, actualite: { id: '9' } });
  });

  it('getAllActualitesAction liste les actualités', async () => {
    actuRepo.getAll.mockResolvedValue([{ id: '1' }]);
    expect(await getAllActualitesAction()).toMatchObject({ success: true });
  });

  it('reorderActualitesAction réordonne', async () => {
    expect(await reorderActualitesAction([{ id: '1', order: 1 }])).toEqual({ success: true });
    expect(actuRepo.reorderMany).toHaveBeenCalled();
  });
});

describe('chemins d\'erreur (catch)', () => {
  beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });

  it('saveDisciplineAction capture une erreur repository', async () => {
    discRepo.save.mockRejectedValue(new Error('db down'));
    expect(await saveDisciplineAction({ title: 'Boxe', description: '' } as never)).toEqual({ success: false, error: 'db down' });
  });
  it('getAllDisciplinesAction capture une erreur', async () => {
    discRepo.getAll.mockRejectedValue(new Error('db'));
    expect(await getAllDisciplinesAction()).toMatchObject({ success: false });
  });
  it('reorderDisciplinesAction capture une erreur', async () => {
    discRepo.reorderMany.mockRejectedValue(new Error('db'));
    expect(await reorderDisciplinesAction([{ id: '1', order: 1 }])).toMatchObject({ success: false });
  });
  it('saveActualiteAction capture une erreur', async () => {
    actuRepo.save.mockRejectedValue(new Error('db'));
    expect(await saveActualiteAction({ title: 'Actu', description: '' } as never)).toMatchObject({ success: false });
  });
  it('getActualiteByIdAction capture une erreur', async () => {
    actuRepo.getById.mockRejectedValue(new Error('db'));
    expect(await getActualiteByIdAction('1')).toMatchObject({ success: false });
  });
  it('getAllActualitesAction capture une erreur', async () => {
    actuRepo.getAll.mockRejectedValue(new Error('db'));
    expect(await getAllActualitesAction()).toMatchObject({ success: false });
  });
  it('reorderActualitesAction capture une erreur', async () => {
    actuRepo.reorderMany.mockRejectedValue(new Error('db'));
    expect(await reorderActualitesAction([{ id: '1', order: 1 }])).toMatchObject({ success: false });
  });
  it('uploadPhotoAction capture une erreur d\'upload', async () => {
    mockUpload.mockRejectedValue(new Error('upload fail'));
    expect(await uploadPhotoAction(fd(fakeImage()))).toMatchObject({ success: false });
  });
  it('uploadActualitePhotoAction capture une erreur d\'upload', async () => {
    mockUpload.mockRejectedValue(new Error('upload fail'));
    expect(await uploadActualitePhotoAction(fd(fakeImage()))).toMatchObject({ success: false });
  });
});

describe('upload d\'images (validation)', () => {
  it('refuse l\'absence de fichier', async () => {
    expect(await uploadPhotoAction(fd(null))).toEqual({ success: false, error: 'No file provided' });
  });

  it('refuse un fichier trop volumineux', async () => {
    const res = await uploadPhotoAction(fd(fakeImage({ size: 6 * 1024 * 1024 })));
    expect(res).toEqual({ success: false, error: 'File too large (max 5MB)' });
  });

  it('refuse un type non autorisé', async () => {
    const res = await uploadPhotoAction(fd(fakeImage({ type: 'application/pdf' })));
    expect(res.success).toBe(false);
  });

  it('téléverse une image valide (discipline)', async () => {
    const res = await uploadPhotoAction(fd(fakeImage()));
    expect(res).toMatchObject({ success: true, blurDataUrl: 'blur' });
    expect(mockUpload).toHaveBeenCalledWith(expect.anything(), 'disciplines');
  });

  it('téléverse une image valide (actualité)', async () => {
    const res = await uploadActualitePhotoAction(fd(fakeImage()));
    expect(res).toMatchObject({ success: true });
    expect(mockUpload).toHaveBeenCalledWith(expect.anything(), 'actualites');
  });
});

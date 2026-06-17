import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  findMany: vi.fn(), qDelete: vi.fn(), docDeleteMany: vi.fn(), inscUpdateMany: vi.fn(),
  deleteR2: vi.fn(), deleteCloud: vi.fn(),
}));

vi.mock('@/shared/lib/prisma', () => ({
  prisma: {
    inscription: { findMany: h.findMany, updateMany: h.inscUpdateMany },
    questionnaireSante: { deleteMany: h.qDelete },
    document: { deleteMany: h.docDeleteMany },
  },
}));
vi.mock('@/shared/lib/upload', () => ({ deleteR2Object: h.deleteR2 }));
vi.mock('@/shared/lib/cloudinary.server', () => ({ deleteCloudinaryAssetByUrl: h.deleteCloud }));

import { purgerDonneesSanteSaison } from './purge-sante';

beforeEach(() => {
  vi.clearAllMocks();
  h.qDelete.mockResolvedValue({ count: 0 });
  h.docDeleteMany.mockResolvedValue({ count: 0 });
  h.inscUpdateMany.mockResolvedValue({ count: 0 });
});

describe('purgerDonneesSanteSaison', () => {
  it('supprime fichiers, questionnaires et documents puis reset les inscriptions', async () => {
    h.findMany.mockResolvedValue([
      { id: 1, documents: [
        { type: 'MEDICAL_CERTIFICATE', url: 'https://pub.r2.dev/c/1.pdf' },
        { type: 'ID_PHOTO', url: 'https://res.cloudinary.com/d/image/upload/v1/p/a.jpg' },
      ] },
    ]);

    const res = await purgerDonneesSanteSaison([1]);

    expect(h.deleteR2).toHaveBeenCalledWith('https://pub.r2.dev/c/1.pdf');
    expect(h.deleteCloud).toHaveBeenCalledWith('https://res.cloudinary.com/d/image/upload/v1/p/a.jpg');
    expect(h.qDelete).toHaveBeenCalledWith({ where: { inscriptionId: { in: [1] } } });
    expect(h.docDeleteMany).toHaveBeenCalledWith({ where: { inscriptionId: { in: [1] }, type: { in: ['MEDICAL_CERTIFICATE', 'ID_PHOTO'] } } });
    expect(h.inscUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: [1] } },
      data: { photo: null, certificatMedical: 'non_fourni', certificatMedicalReq: false },
    });
    expect(res.documentsPurges).toBe(2);
  });

  it('ne touche à rien si la liste d’inscriptions est vide', async () => {
    const res = await purgerDonneesSanteSaison([]);
    expect(h.findMany).not.toHaveBeenCalled();
    expect(res).toEqual({ questionnairesPurges: 0, documentsPurges: 0 });
  });

  it('continue malgré l’échec de suppression d’un fichier', async () => {
    h.findMany.mockResolvedValue([{ id: 1, documents: [{ type: 'ID_PHOTO', url: 'https://res.cloudinary.com/d/image/upload/v1/p/a.jpg' }] }]);
    h.deleteCloud.mockRejectedValue(new Error('boom'));
    await expect(purgerDonneesSanteSaison([1])).resolves.toBeDefined();
    expect(h.qDelete).toHaveBeenCalled();
  });
});

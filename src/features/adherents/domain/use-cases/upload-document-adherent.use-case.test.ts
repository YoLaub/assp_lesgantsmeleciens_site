// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpload = vi.hoisted(() => vi.fn());
const repo = vi.hoisted(() => ({
  deleteDocumentsByType: vi.fn(),
  createDocument: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/shared/lib/upload', () => ({ uploadDocumentFile: mockUpload }));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({ inscriptionRepository: repo }));

import { uploadDocumentAdherentUseCase } from './upload-document-adherent.use-case';

const fakeFile = { name: 'certif.pdf' } as File;

describe('uploadDocumentAdherentUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ url: 'https://cdn/certif.pdf' });
  });

  it('téléverse, remplace les docs du type et crée le nouveau document', async () => {
    const url = await uploadDocumentAdherentUseCase(1, fakeFile, 'ID_PHOTO');
    expect(url).toBe('https://cdn/certif.pdf');
    expect(repo.deleteDocumentsByType).toHaveBeenCalledWith(1, 'ID_PHOTO');
    expect(repo.createDocument).toHaveBeenCalledWith(1, 'ID_PHOTO', 'https://cdn/certif.pdf', 'certif.pdf');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('passe le certificat médical à "declare"', async () => {
    await uploadDocumentAdherentUseCase(2, fakeFile, 'MEDICAL_CERTIFICATE');
    expect(repo.update).toHaveBeenCalledWith(2, { certificatMedical: 'declare' });
  });
});

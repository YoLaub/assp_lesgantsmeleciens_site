// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockSend = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class { send = mockSend; },
  PutObjectCommand: class { constructor(public input: unknown) {} },
}));

import { uploadDocumentAction } from './upload.actions';

const fakeFile = () => ({
  name: 'mon certif.pdf', type: 'application/pdf',
  arrayBuffer: async () => new ArrayBuffer(8),
} as unknown as File);
const fd = (file: File | null) => ({ get: () => file } as unknown as FormData);

beforeEach(() => { vi.clearAllMocks(); vi.spyOn(console, 'error').mockImplementation(() => {}); });

describe('uploadDocumentAction (R2)', () => {
  it('refuse l\'absence de fichier', async () => {
    expect(await uploadDocumentAction(fd(null))).toMatchObject({ success: false, fileKey: null });
  });

  it('téléverse vers R2 et retourne une fileKey nettoyée', async () => {
    mockSend.mockResolvedValue({});
    const res = await uploadDocumentAction(fd(fakeFile()));
    expect(res.success).toBe(true);
    expect(res.fileKey).toMatch(/^certificats\/\d+-mon_certif\.pdf$/);
    expect(mockSend).toHaveBeenCalled();
  });

  it('gère une erreur d\'upload', async () => {
    mockSend.mockRejectedValue(new Error('R2 down'));
    expect(await uploadDocumentAction(fd(fakeFile()))).toMatchObject({ success: false, fileKey: null });
  });
});

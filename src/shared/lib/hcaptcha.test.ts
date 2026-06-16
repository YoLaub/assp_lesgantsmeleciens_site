// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { verifyHCaptcha } from './hcaptcha';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  process.env.HCAPTCHA_SECRET = 'secret';
});
afterEach(() => vi.unstubAllGlobals());

describe('verifyHCaptcha', () => {
  it('retourne false sans secret configuré', async () => {
    delete process.env.HCAPTCHA_SECRET;
    expect(await verifyHCaptcha('tok')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retourne true si hCaptcha valide le token', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ success: true }) });
    expect(await verifyHCaptcha('tok')).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('https://api.hcaptcha.com/siteverify', expect.objectContaining({ method: 'POST' }));
  });

  it('retourne false si hCaptcha rejette', async () => {
    fetchMock.mockResolvedValue({ json: async () => ({ success: false }) });
    expect(await verifyHCaptcha('tok')).toBe(false);
  });
});

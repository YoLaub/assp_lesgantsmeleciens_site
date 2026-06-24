import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ compress: vi.fn() }));
vi.mock('browser-image-compression', () => ({ default: h.compress }));

import { compressImageIfNeeded } from './compress-image';

/** Crée un File de `size` octets et de type MIME donné. */
function makeFile(size: number, type: string, name = 'fichier'): File {
    return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('compressImageIfNeeded', () => {
    it('renvoie un PDF intact sans appeler la compression', async () => {
        const pdf = makeFile(2000, 'application/pdf', 'certificat.pdf');
        const res = await compressImageIfNeeded(pdf);
        expect(res).toBe(pdf);
        expect(h.compress).not.toHaveBeenCalled();
    });

    it('compresse une image et renvoie le fichier réduit', async () => {
        const original = makeFile(6_000_000, 'image/jpeg', 'photo.jpg');
        const reduit = makeFile(300_000, 'image/jpeg', 'photo.jpg');
        h.compress.mockResolvedValue(reduit);

        const res = await compressImageIfNeeded(original);

        expect(res).toBe(reduit);
        expect(h.compress).toHaveBeenCalledWith(
            original,
            expect.objectContaining({ maxSizeMB: 1, maxWidthOrHeight: 1600, preserveExif: true, fileType: 'image/jpeg' }),
        );
    });

    it('garde l’original si la compression l’a paradoxalement grossi', async () => {
        const original = makeFile(120_000, 'image/png', 'petite.png');
        const grossi = makeFile(200_000, 'image/png', 'petite.png');
        h.compress.mockResolvedValue(grossi);

        const res = await compressImageIfNeeded(original);
        expect(res).toBe(original);
    });

    it('renvoie l’original (sans planter) si la compression échoue', async () => {
        const original = makeFile(5_000_000, 'image/webp', 'photo.webp');
        h.compress.mockRejectedValue(new Error('worker indisponible'));
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const res = await compressImageIfNeeded(original);

        expect(res).toBe(original);
        expect(errSpy).toHaveBeenCalled();
        errSpy.mockRestore();
    });
});

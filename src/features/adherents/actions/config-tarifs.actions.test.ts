// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ auth: vi.fn(), findFirst: vi.fn(), create: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ auth: h.auth }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/shared/lib/prisma', () => ({
  prisma: { configTarifs: { findFirst: h.findFirst, create: h.create } },
}));

import { getConfigTarifsAction, updateConfigTarifsAction } from './config-tarifs.actions';

const valid = { saison: '2025-2026', tarifEnfant: 80, tarifAdos: 120, tarifAdulte: 140, supplementOxygene: 40, deductionCouponSport: 50 };

beforeEach(() => { vi.clearAllMocks(); h.auth.mockResolvedValue({ userId: 'admin' }); });

describe('config tarifs', () => {
  it('getConfigTarifsAction retourne la dernière config', async () => {
    h.findFirst.mockResolvedValue({ id: 1, ...valid });
    expect(await getConfigTarifsAction()).toMatchObject({ saison: '2025-2026' });
  });
  it('refuse une mise à jour non authentifiée', async () => {
    h.auth.mockResolvedValue({ userId: null });
    expect(await updateConfigTarifsAction(valid)).toMatchObject({ success: false });
  });
  it('refuse des tarifs invalides (négatifs)', async () => {
    expect(await updateConfigTarifsAction({ ...valid, tarifEnfant: -1 })).toMatchObject({ success: false, error: 'Données invalides' });
  });
  it('crée une nouvelle config tarifaire', async () => {
    h.create.mockResolvedValue({ id: 2, ...valid });
    const res = await updateConfigTarifsAction(valid);
    expect(res).toMatchObject({ success: true });
    expect(h.create).toHaveBeenCalled();
  });
});

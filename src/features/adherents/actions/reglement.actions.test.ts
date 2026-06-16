// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ auth: vi.fn(), findFirst: vi.fn(), update: vi.fn(), create: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ auth: h.auth }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/shared/lib/prisma', () => ({
  prisma: { reglementInterieur: { findFirst: h.findFirst, update: h.update, create: h.create } },
}));

import { getReglementAction, updateReglementAction } from './reglement.actions';

beforeEach(() => { vi.clearAllMocks(); h.auth.mockResolvedValue({ userId: 'admin' }); });

describe('getReglementAction', () => {
  it('retourne le contenu existant', async () => {
    h.findFirst.mockResolvedValue({ contenu: '<p>Règles</p>' });
    expect(await getReglementAction()).toEqual({ contenu: '<p>Règles</p>' });
  });
  it('retourne un contenu par défaut si absent', async () => {
    h.findFirst.mockResolvedValue(null);
    expect((await getReglementAction()).contenu).toMatch(/pas encore été configuré/);
  });
});

describe('updateReglementAction', () => {
  it('refuse si non authentifié', async () => {
    h.auth.mockResolvedValue({ userId: null });
    expect(await updateReglementAction({ contenu: 'x' })).toMatchObject({ success: false });
  });
  it('refuse un contenu vide', async () => {
    expect(await updateReglementAction({ contenu: '' })).toMatchObject({ success: false, error: 'Données invalides' });
  });
  it('met à jour le règlement existant', async () => {
    h.findFirst.mockResolvedValue({ id: 3 });
    expect(await updateReglementAction({ contenu: 'Nouveau' })).toEqual({ success: true });
    expect(h.update).toHaveBeenCalled();
  });
  it('crée le règlement s\'il n\'existe pas', async () => {
    h.findFirst.mockResolvedValue(null);
    expect(await updateReglementAction({ contenu: 'Nouveau' })).toEqual({ success: true });
    expect(h.create).toHaveBeenCalled();
  });
});

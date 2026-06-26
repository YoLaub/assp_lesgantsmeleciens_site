// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ auth: vi.fn(), findFirst: vi.fn(), create: vi.fn() }));
vi.mock('@clerk/nextjs/server', () => ({ auth: h.auth }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/shared/lib/prisma', () => ({
  prisma: { association: { findFirst: h.findFirst, create: h.create } },
}));

import { getAssociationAction, updateAssociationAction } from './association.actions';

const PAYLOAD_VALIDE = {
  email: 'contact@asso.fr',
  telephone: '07 66 99 94 80',
  lieu: 'Complexe sportif de la Madeleine, 56420 PLUMELEC',
  president: 'Christophe Barbereau',
  secretaire: 'Sophie Le Guennec',
  viceSecretaire: 'Dephine Ciotta',
  tresorier: 'Sylvain Trouillard',
  viceTresoriere: 'Emmanuelle Trouillard',
  instagramUrl: 'https://instagram.com/asso',
  xUrl: '',
  youtubeUrl: '',
};

beforeEach(() => { vi.clearAllMocks(); h.auth.mockResolvedValue({ userId: 'admin' }); });

describe('getAssociationAction', () => {
  it('retourne la ligne existante', async () => {
    const row = { id: 1, email: 'reel@asso.fr', telephone: '01', lieu: 'X' };
    h.findFirst.mockResolvedValue(row);
    expect(await getAssociationAction()).toMatchObject({ email: 'reel@asso.fr' });
  });

  it('retourne les valeurs par défaut si la table est vide', async () => {
    h.findFirst.mockResolvedValue(null);
    const asso = await getAssociationAction();
    expect(asso.email).toBe('lesgantsmeleciens@gmail.com');
    expect(asso.president).toBe('Christophe Barbereau');
  });
});

describe('updateAssociationAction', () => {
  it('refuse si non authentifié', async () => {
    h.auth.mockResolvedValue({ userId: null });
    expect(await updateAssociationAction(PAYLOAD_VALIDE)).toMatchObject({ success: false });
  });

  it('refuse un email invalide', async () => {
    expect(await updateAssociationAction({ ...PAYLOAD_VALIDE, email: 'pas-un-email' }))
      .toMatchObject({ success: false, error: 'Données invalides' });
  });

  it('refuse une URL de réseau social invalide', async () => {
    expect(await updateAssociationAction({ ...PAYLOAD_VALIDE, instagramUrl: 'javascript:alert(1)' }))
      .toMatchObject({ success: false, error: 'Données invalides' });
  });

  it('crée la config avec modifiePar quand les données sont valides', async () => {
    h.create.mockResolvedValue({ id: 2 });
    expect(await updateAssociationAction(PAYLOAD_VALIDE)).toEqual({ success: true });
    expect(h.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ modifiePar: 'admin' }) }),
    );
  });

  it('normalise les URLs vides en null', async () => {
    h.create.mockResolvedValue({ id: 3 });
    await updateAssociationAction(PAYLOAD_VALIDE);
    const arg = h.create.mock.calls[0][0];
    expect(arg.data.xUrl).toBeNull();
    expect(arg.data.youtubeUrl).toBeNull();
  });
});

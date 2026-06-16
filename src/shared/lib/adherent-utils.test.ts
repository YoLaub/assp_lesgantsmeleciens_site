// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindUnique = vi.hoisted(() => vi.fn());

vi.mock('./prisma', () => ({
  prisma: {
    membre: { findUnique: mockFindUnique },
  },
}));

import { calculerCategorie, genererNumeroMembreUnique } from './adherent-utils';

function ageDate(annees: number, decalageJours = 0): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - annees);
  d.setDate(d.getDate() - decalageJours);
  return d;
}

describe('calculerCategorie', () => {
  it('retourne "enfant" pour moins de 12 ans', () => {
    expect(calculerCategorie(ageDate(5))).toBe('enfant');
    expect(calculerCategorie(ageDate(11, 1))).toBe('enfant');
  });

  it('retourne "ados" entre 12 et 17 ans inclus', () => {
    expect(calculerCategorie(ageDate(12, 1))).toBe('ados');
    expect(calculerCategorie(ageDate(17, 1))).toBe('ados');
  });

  it('retourne "adulte" à partir de 18 ans', () => {
    expect(calculerCategorie(ageDate(18, 1))).toBe('adulte');
    expect(calculerCategorie(ageDate(40))).toBe('adulte');
  });
});

describe('genererNumeroMembreUnique', () => {
  beforeEach(() => vi.clearAllMocks());

  it('génère un numéro au format ADH-XXXXX', async () => {
    mockFindUnique.mockResolvedValue(null);
    const numero = await genererNumeroMembreUnique();
    expect(numero).toMatch(/^ADH-[A-Z0-9]{5}$/);
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
  });

  it('réessaie tant que le numéro existe déjà', async () => {
    mockFindUnique
      .mockResolvedValueOnce({ id: 'deja-pris' })
      .mockResolvedValueOnce({ id: 'encore-pris' })
      .mockResolvedValueOnce(null);
    const numero = await genererNumeroMembreUnique();
    expect(numero).toMatch(/^ADH-[A-Z0-9]{5}$/);
    expect(mockFindUnique).toHaveBeenCalledTimes(3);
  });
});

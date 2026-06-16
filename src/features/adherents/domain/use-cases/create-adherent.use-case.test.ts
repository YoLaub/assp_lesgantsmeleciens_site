// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  configTarifs: { findFirst: vi.fn() },
  inscription: { findFirst: vi.fn() },
  membre: { update: vi.fn() },
}));
const membreRepo = vi.hoisted(() => ({ generateUniqueNumero: vi.fn(), create: vi.fn(), findById: vi.fn() }));
const inscriptionRepo = vi.hoisted(() => ({ getCurrentSaison: vi.fn(), create: vi.fn(), update: vi.fn(), findCurrentByMembreId: vi.fn() }));

vi.mock('@/shared/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/features/adhesion/data/repositories/membre.repository.impl', () => ({ membreRepository: membreRepo }));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({ inscriptionRepository: inscriptionRepo }));
vi.mock('@/shared/lib/token', () => ({ hashToken: (t: string) => `hashed:${t}` }));

import { createAdherentUseCase } from './create-adherent.use-case';

const config = { tarifEnfant: 80, tarifAdos: 120, tarifAdulte: 140, supplementOxygene: 40, deductionCouponSport: 50 };
const base = { nom: 'Test', prenom: 'Alice', sexe: 'F', email: 'a@t.fr', oxygene: false, couponSport: false, bonCaf: false };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.configTarifs.findFirst.mockResolvedValue(config);
  inscriptionRepo.getCurrentSaison.mockResolvedValue('2025-2026');
  prismaMock.inscription.findFirst.mockResolvedValue(null);
  membreRepo.generateUniqueNumero.mockResolvedValue('ADH-NEW');
  membreRepo.create.mockResolvedValue({ id: 'm-1', numeroAdherent: 'ADH-NEW' });
});

describe('createAdherentUseCase', () => {
  it('lève une erreur si la config tarifs est absente', async () => {
    prismaMock.configTarifs.findFirst.mockResolvedValue(null);
    await expect(createAdherentUseCase({ ...base, dateDeNaissance: new Date('1990-01-01') })).rejects.toThrow('Configuration des tarifs');
  });

  it('crée une nouvelle inscription adulte au tarif de base', async () => {
    const res = await createAdherentUseCase({ ...base, dateDeNaissance: new Date('1990-01-01') });
    expect(res).toMatchObject({ numeroAdherent: 'ADH-NEW', montant: 140, categorie: 'adulte' });
    expect(inscriptionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ statut: 'ACTIF', renouvellement: false }));
  });

  it('applique le supplément oxygène et la déduction Pass Sport (enfant)', async () => {
    const res = await createAdherentUseCase({ ...base, dateDeNaissance: new Date(new Date().getFullYear() - 8, 0, 1), oxygene: true, couponSport: true });
    // 80 + 40 - 50 = 70
    expect(res.montant).toBe(70);
    expect(res.categorie).toBe('enfant');
  });

  it('détecte un renouvellement si une inscription validée existe', async () => {
    prismaMock.inscription.findFirst.mockResolvedValue({ id: 99 });
    await createAdherentUseCase({ ...base, dateDeNaissance: new Date('1990-01-01') });
    expect(inscriptionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ renouvellement: true }));
  });

  it('met à jour l\'inscription existante en conversion (membreId fourni)', async () => {
    inscriptionRepo.findCurrentByMembreId.mockResolvedValue({ id: 55 });
    membreRepo.findById.mockResolvedValue({ id: 'm-existant', numeroAdherent: 'ADH-OLD' });
    const res = await createAdherentUseCase({ ...base, dateDeNaissance: new Date('1990-01-01'), membreId: 'm-existant' });
    expect(inscriptionRepo.update).toHaveBeenCalledWith(55, expect.objectContaining({ statut: 'ACTIF' }));
    expect(res.numeroAdherent).toBe('ADH-OLD');
    expect(inscriptionRepo.create).not.toHaveBeenCalled();
  });

  it('lève une erreur si l\'inscription essayant est introuvable en conversion', async () => {
    inscriptionRepo.findCurrentByMembreId.mockResolvedValue(null);
    await expect(createAdherentUseCase({ ...base, dateDeNaissance: new Date('1990-01-01'), membreId: 'm-x' })).rejects.toThrow('Inscription essayant introuvable');
  });
});

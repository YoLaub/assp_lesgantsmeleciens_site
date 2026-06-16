// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const inscriptionRepo = vi.hoisted(() => ({
  findById: vi.fn(),
  findByToken: vi.fn(),
  findAllEssayants: vi.fn(),
  createPresence: vi.fn(),
  update: vi.fn(),
}));
const membreRepo = vi.hoisted(() => ({
  findByEmailAndNumero: vi.fn(),
  updateToken: vi.fn(),
}));
const mockMembreUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: inscriptionRepo,
}));
vi.mock('@/features/adhesion/data/repositories/membre.repository.impl', () => ({
  membreRepository: membreRepo,
}));
vi.mock('@/shared/lib/prisma', () => ({ prisma: { membre: { update: mockMembreUpdate } } }));
vi.mock('@/shared/lib/token', () => ({ hashToken: (t: string) => `hashed:${t}` }));

import { pointerPresenceUseCase } from './pointer-presence.use-case';
import { getMonEssaiUseCase } from './get-mon-essai.use-case';
import { requestAccesEssaiUseCase } from './request-acces-essai.use-case';
import { getEssayantsForCoachUseCase } from './get-essayants-for-coach.use-case';

const essayant = (over: Record<string, unknown> = {}) => ({
  id: 1, statut: 'ESSAYANT', accesBloque: false, nombrePresences: 0,
  membre: { id: 'm-1', email: 'e@test.fr', prenom: 'Eva', numeroAdherent: 'ADH-1', nom: 'Test' },
  ...over,
});

describe('pointerPresenceUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuse un essayant introuvable', async () => {
    inscriptionRepo.findById.mockResolvedValue(null);
    expect(await pointerPresenceUseCase(1, 'Coach')).toEqual({ success: false, error: 'Essayant introuvable' });
  });

  it('refuse une inscription non ESSAYANT', async () => {
    inscriptionRepo.findById.mockResolvedValue(essayant({ statut: 'ACTIF' }));
    expect(await pointerPresenceUseCase(1, 'Coach')).toEqual({ success: false, error: 'Essayant introuvable' });
  });

  it('refuse un accès déjà bloqué', async () => {
    inscriptionRepo.findById.mockResolvedValue(essayant({ accesBloque: true }));
    const res = await pointerPresenceUseCase(1, 'Coach');
    expect(res.success).toBe(false);
  });

  it('incrémente la présence sans bloquer avant le 3e cours', async () => {
    inscriptionRepo.findById.mockResolvedValue(essayant({ nombrePresences: 0 }));
    const res = await pointerPresenceUseCase(1, 'Coach');
    expect(res).toMatchObject({ success: true, nouvPresences: 1, bloque: false, newToken: undefined });
    expect(inscriptionRepo.createPresence).toHaveBeenCalledWith(1, 'Coach');
    expect(inscriptionRepo.update).toHaveBeenCalledWith(1, { nombrePresences: 1, accesBloque: false });
    expect(mockMembreUpdate).not.toHaveBeenCalled();
  });

  it('bloque et génère un nouveau token au 3e cours', async () => {
    inscriptionRepo.findById.mockResolvedValue(essayant({ nombrePresences: 2 }));
    const res = await pointerPresenceUseCase(1, 'Coach');
    expect(res).toMatchObject({ success: true, nouvPresences: 3, bloque: true });
    expect(res.newToken).toBeTruthy();
    expect(mockMembreUpdate).toHaveBeenCalledTimes(1);
    expect(inscriptionRepo.update).toHaveBeenCalledWith(1, { nombrePresences: 3, accesBloque: true });
  });
});

describe('getMonEssaiUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne null si non ESSAYANT', async () => {
    inscriptionRepo.findByToken.mockResolvedValue(essayant({ statut: 'ACTIF' }));
    expect(await getMonEssaiUseCase('tok')).toBeNull();
  });

  it('mappe les données du suivi essai', async () => {
    inscriptionRepo.findByToken.mockResolvedValue(essayant({ nombrePresences: 2 }));
    const res = await getMonEssaiUseCase('tok');
    expect(res).toMatchObject({ inscriptionId: 1, prenom: 'Eva', nombrePresences: 2, accesBloque: false });
  });
});

describe('requestAccesEssaiUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne null si le membre est introuvable', async () => {
    membreRepo.findByEmailAndNumero.mockResolvedValue(null);
    expect(await requestAccesEssaiUseCase('e@test.fr', 'ADH-1')).toBeNull();
  });

  it('génère un token et met à jour le membre', async () => {
    membreRepo.findByEmailAndNumero.mockResolvedValue({ id: 'm-1', email: 'e@test.fr', prenom: 'Eva' });
    const res = await requestAccesEssaiUseCase('e@test.fr', 'ADH-1');
    expect(res).toMatchObject({ email: 'e@test.fr', prenom: 'Eva' });
    expect(res?.token).toBeTruthy();
    expect(membreRepo.updateToken).toHaveBeenCalledOnce();
  });
});

describe('getEssayantsForCoachUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mappe les essayants avec leurs présences', async () => {
    inscriptionRepo.findAllEssayants.mockResolvedValue([essayant({ presences: [{ pointeLe: new Date() }] })]);
    const res = await getEssayantsForCoachUseCase();
    expect(res).toHaveLength(1);
    expect(res[0]).toMatchObject({ id: 1, prenom: 'Eva', nombrePresences: 0 });
    expect(res[0].presences).toHaveLength(1);
  });
});

// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const membreRepo = vi.hoisted(() => ({ generateUniqueNumero: vi.fn(), create: vi.fn() }));
const inscriptionRepo = vi.hoisted(() => ({ getCurrentSaison: vi.fn(), create: vi.fn() }));

vi.mock('@/features/adhesion/data/repositories/membre.repository.impl', () => ({ membreRepository: membreRepo }));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({ inscriptionRepository: inscriptionRepo }));
vi.mock('@/shared/lib/token', () => ({ hashToken: (t: string) => `hashed:${t}` }));

import { createEssayantUseCase } from './create-essayant.use-case';

describe('createEssayantUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    membreRepo.generateUniqueNumero.mockResolvedValue('ADH-NEW');
    inscriptionRepo.getCurrentSaison.mockResolvedValue('2025-2026');
    membreRepo.create.mockResolvedValue({ id: 'm-1', numeroAdherent: 'ADH-NEW' });
  });

  it('crée le membre et son inscription ESSAYANT', async () => {
    const res = await createEssayantUseCase({
      nom: 'Test', prenom: 'Alice', email: 'a@t.fr', telephone: '06', dateDeNaissance: new Date('2010-01-01'),
    });

    expect(membreRepo.create).toHaveBeenCalledWith(expect.objectContaining({ numeroAdherent: 'ADH-NEW', accesToken: expect.stringContaining('hashed:') }));
    expect(inscriptionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ statut: 'ESSAYANT', saison: '2025-2026', membreId: 'm-1' }));
    expect(res).toMatchObject({ numeroAdherent: 'ADH-NEW' });
    expect(res.accesToken).toBeTruthy();
  });
});

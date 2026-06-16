// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockMembreUpdate = vi.hoisted(() => vi.fn());
const mockInscriptionUpdate = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
  prisma: { membre: { update: mockMembreUpdate } },
}));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { update: mockInscriptionUpdate },
}));

import { updateTelephoneUseCase } from './update-telephone.use-case';

describe('updateTelephoneUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('met à jour le téléphone du membre et le second numéro sur l\'inscription', async () => {
    await updateTelephoneUseCase({ id: 1, membreId: 'm-1' }, '0612345678', '0698765432');
    expect(mockMembreUpdate).toHaveBeenCalledWith({ where: { id: 'm-1' }, data: { telephone: '0612345678' } });
    expect(mockInscriptionUpdate).toHaveBeenCalledWith(1, { telephone2: '0698765432' });
  });

  it('met le second numéro à null quand il est absent', async () => {
    await updateTelephoneUseCase({ id: 2, membreId: 'm-2' }, '0612345678');
    expect(mockInscriptionUpdate).toHaveBeenCalledWith(2, { telephone2: null });
  });
});

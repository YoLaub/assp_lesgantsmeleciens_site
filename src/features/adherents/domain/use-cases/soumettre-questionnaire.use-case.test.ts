// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockUpsert = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { upsertQuestionnaire: mockUpsert, update: mockUpdate },
}));

import { soumettreQuestionnaireUseCase } from './soumettre-questionnaire.use-case';

describe('soumettreQuestionnaireUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exige un certificat dès qu\'une réponse est OUI', async () => {
    const res = await soumettreQuestionnaireUseCase(1, 'majeur', { q1: false, q2: true, q3: false });
    expect(res).toEqual({ certificatMedicalReq: true });
    expect(mockUpsert).toHaveBeenCalledWith(1, 'majeur', { q1: false, q2: true, q3: false });
    expect(mockUpdate).toHaveBeenCalledWith(1, { certificatMedicalReq: true, certificatMedical: undefined });
  });

  it('n\'exige pas de certificat si toutes les réponses sont NON', async () => {
    const res = await soumettreQuestionnaireUseCase(2, 'mineur', { q1: false, q2: false });
    expect(res).toEqual({ certificatMedicalReq: false });
    expect(mockUpdate).toHaveBeenCalledWith(2, { certificatMedicalReq: false, certificatMedical: 'non_fourni' });
  });
});

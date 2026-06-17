import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ upsert: vi.fn(), update: vi.fn() }));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { upsertQuestionnaire: h.upsert, update: h.update },
}));
vi.mock('@/shared/lib/consent', () => ({ CONSENT_SANTE: { version: 'TEST-V', texte: 'x' } }));

import { soumettreQuestionnaireUseCase } from './soumettre-questionnaire.use-case';

beforeEach(() => vi.clearAllMocks());

describe('soumettreQuestionnaireUseCase', () => {
  it('persiste le consentement (date + version) via upsertQuestionnaire', async () => {
    await soumettreQuestionnaireUseCase(2, 'majeur', { q1: false });
    expect(h.upsert).toHaveBeenCalledTimes(1);
    const [inscriptionId, type, reponses, consent] = h.upsert.mock.calls[0];
    expect(inscriptionId).toBe(2);
    expect(type).toBe('majeur');
    expect(reponses).toEqual({ q1: false });
    expect(consent.version).toBe('TEST-V');
    expect(consent.le).toBeInstanceOf(Date);
  });

  it('calcule certificatMedicalReq=false si toutes les réponses sont false', async () => {
    await soumettreQuestionnaireUseCase(2, 'majeur', { q1: false, q2: false });
    expect(h.update).toHaveBeenCalledWith(2, { certificatMedicalReq: false, certificatMedical: 'non_fourni' });
  });

  it('calcule certificatMedicalReq=true si au moins une réponse est true', async () => {
    const res = await soumettreQuestionnaireUseCase(2, 'majeur', { q1: true });
    expect(res).toEqual({ certificatMedicalReq: true });
    expect(h.update).toHaveBeenCalledWith(2, { certificatMedicalReq: true, certificatMedical: undefined });
  });
});

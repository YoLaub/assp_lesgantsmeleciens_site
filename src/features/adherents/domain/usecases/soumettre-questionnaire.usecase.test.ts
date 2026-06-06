import { describe, it, expect } from 'vitest';
import { okAsync } from '@/shared/lib/result';
import { SoumettreQuestionnaireUseCase } from './soumettre-questionnaire.usecase';
import { createMockAdherentRepository } from '../../__tests__/mock-repository';

const reponsesNegatives = { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q7: false, q8: false, q9: false };
const reponsesAvecQ1 = { ...reponsesNegatives, q1: true };

describe('SoumettreQuestionnaireUseCase', () => {
    it('certificatMedicalReq = false si toutes les réponses sont false', async () => {
        const repo = createMockAdherentRepository();
        repo.upsertQuestionnaire.mockReturnValue(okAsync(undefined));

        const useCase = new SoumettreQuestionnaireUseCase(repo);
        const result = await useCase.execute(1, reponsesNegatives, 'non_fourni');

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().certificatMedicalReq).toBe(false);

        const call = repo.upsertQuestionnaire.mock.calls[0];
        expect(call[2]).toBe(false);
        expect(call[3]).toBe('non_fourni');
    });

    it('certificatMedicalReq = true si au moins une réponse est true', async () => {
        const repo = createMockAdherentRepository();
        repo.upsertQuestionnaire.mockReturnValue(okAsync(undefined));

        const useCase = new SoumettreQuestionnaireUseCase(repo);
        const result = await useCase.execute(1, reponsesAvecQ1, 'non_fourni');

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().certificatMedicalReq).toBe(true);

        const call = repo.upsertQuestionnaire.mock.calls[0];
        expect(call[2]).toBe(true);
    });

    it('conserve le statut certificat existant si req reste true', async () => {
        const repo = createMockAdherentRepository();
        repo.upsertQuestionnaire.mockReturnValue(okAsync(undefined));

        const useCase = new SoumettreQuestionnaireUseCase(repo);
        await useCase.execute(1, reponsesAvecQ1, 'declare');

        const call = repo.upsertQuestionnaire.mock.calls[0];
        expect(call[3]).toBe('declare');
    });
});

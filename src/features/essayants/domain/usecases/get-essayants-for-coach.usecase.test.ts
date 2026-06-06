import { describe, it, expect } from 'vitest';
import { okAsync, errAsync } from '@/shared/lib/result';
import { GetEssayantsForCoachUseCase } from './get-essayants-for-coach.usecase';
import { createMockEssayantRepository } from '../../__tests__/mock-repository';
import { makeCoachToken, makeEssayantForCoach } from '../../__tests__/fixtures';

describe('GetEssayantsForCoachUseCase', () => {
    it('retourne la liste des essayants non convertis', async () => {
        const repo = createMockEssayantRepository();
        const essayants = [makeEssayantForCoach(), makeEssayantForCoach({ id: 2, nom: 'Martin' })];

        repo.findCoachToken.mockReturnValue(okAsync(makeCoachToken()));
        repo.findAllNonConvertis.mockReturnValue(okAsync(essayants));

        const useCase = new GetEssayantsForCoachUseCase(repo);
        const result = await useCase.execute('coach-token-uuid');

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toHaveLength(2);
    });

    it('retourne une erreur si le coach token est invalide', async () => {
        const repo = createMockEssayantRepository();
        repo.findCoachToken.mockReturnValue(okAsync(null));

        const useCase = new GetEssayantsForCoachUseCase(repo);
        const result = await useCase.execute('mauvais-token');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Token invalide ou expiré');
        expect(repo.findAllNonConvertis).not.toHaveBeenCalled();
    });

    it('propage une erreur du repository', async () => {
        const repo = createMockEssayantRepository();
        repo.findCoachToken.mockReturnValue(okAsync(makeCoachToken()));
        repo.findAllNonConvertis.mockReturnValue(errAsync('DB error'));

        const useCase = new GetEssayantsForCoachUseCase(repo);
        const result = await useCase.execute('coach-token-uuid');

        expect(result.isErr()).toBe(true);
    });
});

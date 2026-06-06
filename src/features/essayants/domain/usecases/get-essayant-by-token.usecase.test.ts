import { describe, it, expect } from 'vitest';
import { okAsync, errAsync } from '@/shared/lib/result';
import { GetEssayantByTokenUseCase } from './get-essayant-by-token.usecase';
import { createMockEssayantRepository } from '../../__tests__/mock-repository';
import { makeEssayant } from '../../__tests__/fixtures';

describe('GetEssayantByTokenUseCase', () => {
    it("retourne l'essayant si le token est valide", async () => {
        const repo = createMockEssayantRepository();
        const essayant = makeEssayant();
        repo.findByToken.mockReturnValue(okAsync(essayant));

        const useCase = new GetEssayantByTokenUseCase(repo);
        const result = await useCase.execute('token-test-uuid');

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toEqual(essayant);
    });

    it('retourne une erreur si le token est vide', async () => {
        const repo = createMockEssayantRepository();
        const useCase = new GetEssayantByTokenUseCase(repo);

        const result = await useCase.execute('');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Token manquant');
        expect(repo.findByToken).not.toHaveBeenCalled();
    });

    it('retourne une erreur si le token est invalide ou expiré', async () => {
        const repo = createMockEssayantRepository();
        repo.findByToken.mockReturnValue(okAsync(null));

        const useCase = new GetEssayantByTokenUseCase(repo);
        const result = await useCase.execute('token-invalide');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Lien invalide ou expiré');
    });

    it('propage une erreur du repository', async () => {
        const repo = createMockEssayantRepository();
        repo.findByToken.mockReturnValue(errAsync('DB error'));

        const useCase = new GetEssayantByTokenUseCase(repo);
        const result = await useCase.execute('token-test-uuid');

        expect(result.isErr()).toBe(true);
    });
});

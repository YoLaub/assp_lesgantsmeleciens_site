import { describe, it, expect } from 'vitest';
import { okAsync, errAsync } from '@/shared/lib/result';
import { CreateEssayantUseCase } from './create-essayant.usecase';
import { createMockEssayantRepository } from '../../__tests__/mock-repository';
import { makeEssayant } from '../../__tests__/fixtures';

const validInput = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    telephone: '0600000001',
    dateDeNaissance: new Date('2000-01-15'),
    numeroAdherent: 'ESS-001',
};

describe('CreateEssayantUseCase', () => {
    it('crée un essayant avec des données valides', async () => {
        const repo = createMockEssayantRepository();
        const essayant = makeEssayant();
        repo.createEssayant.mockReturnValue(okAsync(essayant));

        const useCase = new CreateEssayantUseCase(repo);
        const result = await useCase.execute(validInput);

        expect(result.isOk()).toBe(true);
        expect(repo.createEssayant).toHaveBeenCalledOnce();
    });

    it('retourne une erreur si le nom est vide', async () => {
        const repo = createMockEssayantRepository();
        const useCase = new CreateEssayantUseCase(repo);

        const result = await useCase.execute({ ...validInput, nom: '' });

        expect(result.isErr()).toBe(true);
        expect(repo.createEssayant).not.toHaveBeenCalled();
    });

    it('retourne une erreur si le prénom est vide', async () => {
        const repo = createMockEssayantRepository();
        const useCase = new CreateEssayantUseCase(repo);

        const result = await useCase.execute({ ...validInput, prenom: '' });

        expect(result.isErr()).toBe(true);
    });

    it("retourne une erreur si l'email est invalide", async () => {
        const repo = createMockEssayantRepository();
        const useCase = new CreateEssayantUseCase(repo);

        const result = await useCase.execute({ ...validInput, email: 'pas-un-email' });

        expect(result.isErr()).toBe(true);
    });

    it('propage une erreur du repository', async () => {
        const repo = createMockEssayantRepository();
        repo.createEssayant.mockReturnValue(errAsync('Unique constraint email'));

        const useCase = new CreateEssayantUseCase(repo);
        const result = await useCase.execute(validInput);

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Unique constraint email');
    });
});

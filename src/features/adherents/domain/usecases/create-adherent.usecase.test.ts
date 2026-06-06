import { describe, it, expect } from 'vitest';
import { okAsync, errAsync } from '@/shared/lib/result';
import { CreateAdherentUseCase } from './create-adherent.usecase';
import { createMockAdherentRepository } from '../../__tests__/mock-repository';
import { makeAdherent, makeConfigTarifs } from '../../__tests__/fixtures';

const config = makeConfigTarifs();

const validInput = {
    nom: 'Dupont',
    prenom: 'Marie',
    dateDeNaissance: new Date('1990-05-10'),
    sexe: 'F' as const,
    email: 'marie.dupont@example.com',
    oxygene: false,
    couponSport: false,
    bonCaf: false,
    numeroAdherent: 'ADH-001',
    renouvellement: false,
    config,
};

describe('CreateAdherentUseCase', () => {
    it('crée un adhérent adulte avec le bon montant', async () => {
        const repo = createMockAdherentRepository();
        const adherent = makeAdherent({ montantSnapshot: 140 });
        repo.createAdherent.mockReturnValue(okAsync(adherent));

        const useCase = new CreateAdherentUseCase(repo);
        const result = await useCase.execute(validInput);

        expect(result.isOk()).toBe(true);
        const call = repo.createAdherent.mock.calls[0][0];
        expect(call.montantSnapshot).toBe(140);
        expect(call.categorie).toBe('adulte');
    });

    it('ajoute le supplément oxygène au montant', async () => {
        const repo = createMockAdherentRepository();
        repo.createAdherent.mockReturnValue(okAsync(makeAdherent()));

        const useCase = new CreateAdherentUseCase(repo);
        await useCase.execute({ ...validInput, oxygene: true });

        const call = repo.createAdherent.mock.calls[0][0];
        expect(call.montantSnapshot).toBe(180);
    });

    it('déduit le coupon sport du montant', async () => {
        const repo = createMockAdherentRepository();
        repo.createAdherent.mockReturnValue(okAsync(makeAdherent()));

        const useCase = new CreateAdherentUseCase(repo);
        await useCase.execute({ ...validInput, couponSport: true });

        const call = repo.createAdherent.mock.calls[0][0];
        expect(call.montantSnapshot).toBe(90);
    });

    it('applique le tarif enfant si catégorie enfant', async () => {
        const repo = createMockAdherentRepository();
        repo.createAdherent.mockReturnValue(okAsync(makeAdherent()));

        const useCase = new CreateAdherentUseCase(repo);
        await useCase.execute({
            ...validInput,
            dateDeNaissance: new Date('2018-01-01'),
        });

        const call = repo.createAdherent.mock.calls[0][0];
        expect(call.montantSnapshot).toBe(80);
        expect(call.categorie).toBe('enfant');
    });

    it("lie l'essayant si essayantId fourni", async () => {
        const repo = createMockAdherentRepository();
        repo.createAdherent.mockReturnValue(okAsync(makeAdherent({ id: 1 })));
        repo.linkEssayant.mockReturnValue(okAsync(undefined));

        const useCase = new CreateAdherentUseCase(repo);
        await useCase.execute({ ...validInput, essayantId: 42 });

        expect(repo.linkEssayant).toHaveBeenCalledWith(1, 42);
    });

    it('retourne une erreur si le nom est vide', async () => {
        const repo = createMockAdherentRepository();
        const useCase = new CreateAdherentUseCase(repo);

        const result = await useCase.execute({ ...validInput, nom: '' });

        expect(result.isErr()).toBe(true);
        expect(repo.createAdherent).not.toHaveBeenCalled();
    });

    it('propage une erreur du repository', async () => {
        const repo = createMockAdherentRepository();
        repo.createAdherent.mockReturnValue(errAsync('Unique constraint email'));

        const useCase = new CreateAdherentUseCase(repo);
        const result = await useCase.execute(validInput);

        expect(result.isErr()).toBe(true);
    });
});

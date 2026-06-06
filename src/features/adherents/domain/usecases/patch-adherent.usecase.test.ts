import { describe, it, expect } from 'vitest';
import { okAsync } from '@/shared/lib/result';
import { PatchAdherentUseCase } from './patch-adherent.usecase';
import { createMockAdherentRepository } from '../../__tests__/mock-repository';

describe('PatchAdherentUseCase', () => {
    it('accepte les champs autorisés', async () => {
        const repo = createMockAdherentRepository();
        repo.patchAdherent.mockReturnValue(okAsync(undefined));

        const useCase = new PatchAdherentUseCase(repo);
        const result = await useCase.execute(1, { inscriptionValide: true });

        expect(result.isOk()).toBe(true);
        expect(repo.patchAdherent).toHaveBeenCalledWith(1, { inscriptionValide: true });
    });

    it('rejette les champs non autorisés et garde les champs valides', async () => {
        const repo = createMockAdherentRepository();
        repo.patchAdherent.mockReturnValue(okAsync(undefined));
        const useCase = new PatchAdherentUseCase(repo);

        const result = await useCase.execute(1, { stripeSessionId: 'hack', inscriptionValide: true } as object);

        expect(result.isOk()).toBe(true);
        const call = repo.patchAdherent.mock.calls[0][1];
        expect(call).not.toHaveProperty('stripeSessionId');
        expect(call).toHaveProperty('inscriptionValide');
    });

    it('retourne une erreur si aucun champ autorisé', async () => {
        const repo = createMockAdherentRepository();
        const useCase = new PatchAdherentUseCase(repo);

        const result = await useCase.execute(1, { stripeSessionId: 'hack' } as object);

        expect(result.isErr()).toBe(true);
        expect(repo.patchAdherent).not.toHaveBeenCalled();
    });
});

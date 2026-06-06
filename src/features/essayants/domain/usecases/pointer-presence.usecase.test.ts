import { describe, it, expect } from 'vitest';
import { okAsync, errAsync } from '@/shared/lib/result';
import { PointerPresenceUseCase } from './pointer-presence.usecase';
import { createMockEssayantRepository } from '../../__tests__/mock-repository';
import { makeCoachToken, makeEssayant } from '../../__tests__/fixtures';

describe('PointerPresenceUseCase', () => {
    it('incrémente les présences avec un coach token valide', async () => {
        const repo = createMockEssayantRepository();
        const coachToken = makeCoachToken();
        const essayant = makeEssayant({ nombrePresences: 0 });
        const updated = makeEssayant({ nombrePresences: 1, accesBloque: false });

        repo.findCoachToken.mockReturnValue(okAsync(coachToken));
        repo.findById.mockReturnValue(okAsync(essayant));
        repo.pointPresence.mockReturnValue(okAsync(updated));

        const useCase = new PointerPresenceUseCase(repo);
        const result = await useCase.execute(essayant.id, coachToken.token, 'Coach Martin');

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().nombrePresences).toBe(1);
    });

    it('retourne une erreur si le coach token est invalide', async () => {
        const repo = createMockEssayantRepository();
        repo.findCoachToken.mockReturnValue(okAsync(null));

        const useCase = new PointerPresenceUseCase(repo);
        const result = await useCase.execute(1, 'mauvais-token', 'Coach Martin');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Token coach invalide ou expiré');
        expect(repo.findById).not.toHaveBeenCalled();
    });

    it("retourne une erreur si l'essayant est introuvable", async () => {
        const repo = createMockEssayantRepository();
        repo.findCoachToken.mockReturnValue(okAsync(makeCoachToken()));
        repo.findById.mockReturnValue(okAsync(null));

        const useCase = new PointerPresenceUseCase(repo);
        const result = await useCase.execute(999, 'coach-token-uuid', 'Coach Martin');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Essayant introuvable');
    });

    it("retourne une erreur si l'accès est bloqué", async () => {
        const repo = createMockEssayantRepository();
        repo.findCoachToken.mockReturnValue(okAsync(makeCoachToken()));
        repo.findById.mockReturnValue(okAsync(makeEssayant({ accesBloque: true, nombrePresences: 3 })));

        const useCase = new PointerPresenceUseCase(repo);
        const result = await useCase.execute(1, 'coach-token-uuid', 'Coach Martin');

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()).toBe('Accès bloqué — 3 cours déjà effectués');
        expect(repo.pointPresence).not.toHaveBeenCalled();
    });

    it('génère un accesToken lors de la 3ème présence', async () => {
        const repo = createMockEssayantRepository();
        const essayant = makeEssayant({ nombrePresences: 2, accesBloque: false });
        const updated = makeEssayant({ nombrePresences: 3, accesBloque: true, accesToken: 'new-conversion-token' });

        repo.findCoachToken.mockReturnValue(okAsync(makeCoachToken()));
        repo.findById.mockReturnValue(okAsync(essayant));
        repo.pointPresence.mockReturnValue(okAsync(updated));

        const useCase = new PointerPresenceUseCase(repo);
        const result = await useCase.execute(essayant.id, 'coach-token-uuid', 'Coach Martin');

        expect(result.isOk()).toBe(true);
        const value = result._unsafeUnwrap();
        expect(value.nombrePresences).toBe(3);
        expect(value.accesToken).toBe('new-conversion-token');

        const callArgs = repo.pointPresence.mock.calls[0];
        expect(callArgs[2].accesBloque).toBe(true);
        expect(callArgs[2].newAccesToken).toBeDefined();
    });
});

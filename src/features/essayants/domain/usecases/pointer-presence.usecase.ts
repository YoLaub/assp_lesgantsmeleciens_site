import { ResultAsync, errAsync } from '@/shared/lib/result';
import { EssayantRepository } from '../repositories/essayant.repository';

export interface PointerPresenceResult {
    nombrePresences: number;
    accesToken?: string;
}

export class PointerPresenceUseCase {
    constructor(private repository: EssayantRepository) {}

    execute(essayantId: number, coachToken: string, nomCoach: string): ResultAsync<PointerPresenceResult, string> {
        return this.repository.findCoachToken(coachToken).andThen((token) => {
            if (!token) return errAsync('Token coach invalide ou expiré');

            return this.repository.findById(essayantId).andThen((essayant) => {
                if (!essayant) return errAsync('Essayant introuvable');
                if (essayant.accesBloque) return errAsync('Accès bloqué — 3 cours déjà effectués');

                const nouvPresences = essayant.nombrePresences + 1;
                const accesBloque = nouvPresences >= 3;

                let newAccesToken: string | undefined;
                let newAccesTokenExpireLe: Date | undefined;

                if (nouvPresences === 3) {
                    newAccesToken = crypto.randomUUID();
                    newAccesTokenExpireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                }

                return this.repository
                    .pointPresence(essayantId, nomCoach, {
                        nombrePresences: nouvPresences,
                        accesBloque,
                        newAccesToken,
                        newAccesTokenExpireLe,
                    })
                    .map((updated) => ({
                        nombrePresences: updated.nombrePresences,
                        accesToken: updated.accesToken ?? undefined,
                    }));
            });
        });
    }
}

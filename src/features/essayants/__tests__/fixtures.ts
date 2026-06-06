import { CoachToken, Essayant, EssayantForCoach } from '../domain/models/essayant.model';

export function makeEssayant(overrides?: Partial<Essayant>): Essayant {
    return {
        id: 1,
        numeroAdherent: 'ESS-001',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        telephone: '0600000001',
        dateDeNaissance: new Date('2000-01-15'),
        nombrePresences: 0,
        accesBloque: false,
        accesToken: 'token-test-uuid',
        accesTokenExpireLe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ...overrides,
    };
}

export function makeEssayantForCoach(overrides?: Partial<EssayantForCoach>): EssayantForCoach {
    return {
        id: 1,
        numeroAdherent: 'ESS-001',
        nom: 'Dupont',
        prenom: 'Jean',
        nombrePresences: 0,
        accesBloque: false,
        dernierePresenceLe: null,
        ...overrides,
    };
}

export function makeCoachToken(overrides?: Partial<CoachToken>): CoachToken {
    return {
        id: 1,
        token: 'coach-token-uuid',
        expireLe: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creePar: 'clerk-user-id',
        creeLe: new Date(),
        ...overrides,
    };
}

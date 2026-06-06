import { vi } from 'vitest';
import { EssayantRepository } from '../domain/repositories/essayant.repository';

export function createMockEssayantRepository(): {
    [K in keyof EssayantRepository]: ReturnType<typeof vi.fn>;
} {
    return {
        createEssayant: vi.fn(),
        findByToken: vi.fn(),
        findById: vi.fn(),
        findByEmailAndNumero: vi.fn(),
        updateToken: vi.fn(),
        pointPresence: vi.fn(),
        findAllNonConvertis: vi.fn(),
        createCoachToken: vi.fn(),
        findCoachToken: vi.fn(),
        getLatestCoachToken: vi.fn(),
    };
}

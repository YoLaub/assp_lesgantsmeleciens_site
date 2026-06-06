import { vi } from 'vitest';
import { AdherentRepository } from '../domain/repositories/adherent.repository';

export function createMockAdherentRepository(): {
    [K in keyof AdherentRepository]: ReturnType<typeof vi.fn>;
} {
    return {
        createAdherent: vi.fn(),
        linkEssayant: vi.fn(),
        findByToken: vi.fn(),
        findByEmail: vi.fn(),
        findByEmailAndNumero: vi.fn(),
        findAll: vi.fn(),
        findById: vi.fn(),
        updateToken: vi.fn(),
        patchAdherent: vi.fn(),
        upsertQuestionnaire: vi.fn(),
        saveDocument: vi.fn(),
        getConfigTarifs: vi.fn(),
        createConfigTarifs: vi.fn(),
    };
}

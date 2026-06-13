import { vi, type Mock } from 'vitest';
import { ImageRepository } from '../domain/repositories/image.repository';

export function createMockRepository() {
    const mock = {
        getAll: vi.fn(),
        getByCategory: vi.fn(),
        getById: vi.fn(),
        getByIds: vi.fn(),
        save: vi.fn(),
        saveMany: vi.fn(),
        delete: vi.fn(),
        bulkDelete: vi.fn(),
        reorderMany: vi.fn(),
    };
    return mock as unknown as {
        [K in keyof ImageRepository]: Mock<any> & ImageRepository[K];
    };
}

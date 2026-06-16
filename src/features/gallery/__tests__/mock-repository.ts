import { vi } from 'vitest';
import { GalleryImageRepository } from '../domain/repositories/gallery-image.repository';

export function createMockRepository(): {
    [K in keyof GalleryImageRepository]: ReturnType<typeof vi.fn>;
} {
    return {
        getAll: vi.fn(),
        getByCategory: vi.fn(),
        getById: vi.fn(),
        save: vi.fn(),
        saveMany: vi.fn(),
        delete: vi.fn(),
        bulkDelete: vi.fn(),
        reorderMany: vi.fn(),
    };
}

import { Image } from '../domain/models/image.model';

export function makeGalleryImage(overrides?: Partial<Image>): Image {
    return {
        id: 'img-1',
        title: 'Test Image',
        alt: 'Alt text',
        publicId: 'gants-meleciens/gallery/test',
        version: 1719307544,
        format: 'jpg',
        width: 800,
        height: 600,
        bytes: 50000,
        blurDataUrl: 'data:image/svg+xml;base64,xxx',
        order: 0,
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Discipline', slug: 'discipline' },
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

export function makeGalleryImageList(count: number): Image[] {
    return Array.from({ length: count }, (_, i) =>
        makeGalleryImage({
            id: `img-${i + 1}`,
            title: `Image ${i + 1}`,
            publicId: `gants-meleciens/gallery/img-${i + 1}`,
            order: i,
        }),
    );
}

import { GalleryImage } from '../domain/models/gallery-image.model';

export function makeGalleryImage(overrides?: Partial<GalleryImage>): GalleryImage {
    return {
        id: 'img-1',
        title: 'Test Image',
        alt: 'Alt text',
        category: 'test',
        src: '/uploads/gallery/test.jpg',
        width: 800,
        height: 600,
        order: 0,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        ...overrides,
    };
}

export function makeGalleryImageList(count: number): GalleryImage[] {
    return Array.from({ length: count }, (_, i) =>
        makeGalleryImage({
            id: `img-${i + 1}`,
            title: `Image ${i + 1}`,
            order: i,
        }),
    );
}

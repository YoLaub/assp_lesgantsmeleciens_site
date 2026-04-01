import { GalleryImage } from '../domain/models/gallery-image.model';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';

export function makeCloudinaryAsset(overrides?: Partial<CloudinaryAsset>): CloudinaryAsset {
    return {
        publicId: 'gants-meleciens/gallery/test',
        version: 1719307544,
        format: 'jpg',
        width: 800,
        height: 600,
        bytes: 50000,
        resourceType: 'image',
        ...overrides,
    };
}

export function makeGalleryImage(overrides?: Partial<GalleryImage>): GalleryImage {
    return {
        id: 'img-1',
        title: 'Test Image',
        alt: 'Alt text',
        category: 'test',
        asset: makeCloudinaryAsset(),
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
            asset: makeCloudinaryAsset({ publicId: `gants-meleciens/gallery/img-${i + 1}` }),
            order: i,
        }),
    );
}

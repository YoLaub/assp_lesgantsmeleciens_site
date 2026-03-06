import { type CloudinaryAsset } from '@/shared/types/cloudinary';

export type GalleryImage = {
    id: string;
    title: string;
    alt: string;
    category: string;
    asset: CloudinaryAsset;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
};

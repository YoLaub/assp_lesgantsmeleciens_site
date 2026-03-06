import { type CloudinaryAsset } from '@/shared/types/cloudinary';

export type Actualite = {
    id: string;
    title: string;
    description: string;
    tags: string[];
    active: boolean;
    featured: boolean;
    photos: CloudinaryAsset[];
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
    publishedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
};

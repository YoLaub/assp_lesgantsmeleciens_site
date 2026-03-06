import { type CloudinaryAsset } from '@/shared/types/cloudinary';

export type Discipline = {
    id: string;
    title: string;
    coach: string;
    coachPhoto?: CloudinaryAsset | null;
    citation: string;
    category: string;
    description: string;
    tags: string[];
    active: boolean;
    photos: CloudinaryAsset[];
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
};

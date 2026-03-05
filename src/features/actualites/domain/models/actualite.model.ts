export type Actualite = {
    id: string;
    title: string;
    description: string;
    tags: string[];
    active: boolean;
    featured: boolean;
    photo: string[];
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
    publishedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
};

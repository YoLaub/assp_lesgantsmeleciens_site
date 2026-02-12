export type Discipline = {
    id: string;
    title: string;
    coach: string;
    category: string;
    description: string;
    tags: string[];
    active: boolean;
    photo: string[];
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
};
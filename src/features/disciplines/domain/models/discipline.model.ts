export interface Discipline {
    id: string;
    title: string;
    coach: string;
    category: string;
    description: string;
    tags: string[];
    active: boolean;
    photo: (string|null)[];
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
    order: number;
}
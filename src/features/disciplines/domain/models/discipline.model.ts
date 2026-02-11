export type Discipline = {
    id: string;
    title: string;
    coach: string;
    category: string;
    description: string;
    tags: string[];
    active: boolean;
    // Note : PostgreSQL/Prisma gère mieux les tableaux de strings simples.
    // On garde string[] pour la cohérence avec la DB.
    photo: string[];
    seo: {
        metaTitle: string;
        metaDescription: string;
    };
    order: number;
    // Optionnel : ajouter les champs d'audit que Prisma génère souvent
    createdAt?: Date;
    updatedAt?: Date;
};
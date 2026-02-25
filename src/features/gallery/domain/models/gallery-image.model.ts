export type GalleryImage = {
    id: string;
    title: string;
    alt: string;
    category: string;
    src: string;
    width: number;
    height: number;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
};

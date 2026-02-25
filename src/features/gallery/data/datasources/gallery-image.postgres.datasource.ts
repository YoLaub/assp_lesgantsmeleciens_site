import { prisma } from "@/shared/lib/prisma";
import { GalleryImage } from '../../domain/models/gallery-image.model';

export class GalleryImagePostgresDataSource {

    async getGalleryImages(): Promise<GalleryImage[]> {
        const images = await prisma.galleryImage.findMany({
            orderBy: { order: 'asc' },
        });

        return images.map((img) => ({
            id: img.id,
            title: img.title,
            alt: img.alt,
            category: img.category,
            src: img.src,
            width: img.width,
            height: img.height,
            order: img.order,
            createdAt: img.createdAt,
            updatedAt: img.updatedAt,
        }));
    }

    async getGalleryImageById(id: string): Promise<GalleryImage | null> {
        const img = await prisma.galleryImage.findUnique({
            where: { id },
        });

        if (!img) return null;

        return {
            id: img.id,
            title: img.title,
            alt: img.alt,
            category: img.category,
            src: img.src,
            width: img.width,
            height: img.height,
            order: img.order,
            createdAt: img.createdAt,
            updatedAt: img.updatedAt,
        };
    }

    async upsertGalleryImage(image: GalleryImage): Promise<void> {
        await prisma.galleryImage.upsert({
            where: { id: image.id || '' },
            update: {
                title: image.title,
                alt: image.alt,
                category: image.category,
                src: image.src,
                width: image.width,
                height: image.height,
                order: image.order,
                updatedAt: new Date(),
            },
            create: {
                title: image.title,
                alt: image.alt,
                category: image.category,
                src: image.src,
                width: image.width,
                height: image.height,
                order: image.order,
            },
        });
    }

    async deleteGalleryImage(id: string): Promise<void> {
        await prisma.galleryImage.delete({
            where: { id },
        });
    }

    async bulkDeleteGalleryImages(ids: string[]): Promise<void> {
        await prisma.galleryImage.deleteMany({
            where: { id: { in: ids } },
        });
    }
}

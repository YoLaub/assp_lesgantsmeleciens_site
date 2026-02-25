import { prisma } from "@/shared/lib/prisma";
import { ResultAsync } from "@/shared/lib/result";
import { GalleryImage } from '../../domain/models/gallery-image.model';

export class GalleryImagePostgresDataSource {

    getGalleryImages(): ResultAsync<GalleryImage[], string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.findMany({
                orderBy: { order: 'asc' },
            }),
            () => 'Erreur lors de la récupération des images'
        ).map((images) =>
            images.map((img) => ({
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
            }))
        );
    }

    getGalleryImageById(id: string): ResultAsync<GalleryImage | null, string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.findUnique({ where: { id } }),
            () => `Erreur lors de la récupération de l'image ${id}`
        ).map((img) => {
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
        });
    }

    upsertGalleryImage(image: GalleryImage): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.upsert({
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
            }),
            () => "Erreur lors de la sauvegarde de l'image"
        ).map(() => undefined);
    }

    deleteGalleryImage(id: string): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.delete({ where: { id } }),
            () => "Erreur lors de la suppression de l'image"
        ).map(() => undefined);
    }

    bulkDeleteGalleryImages(ids: string[]): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.deleteMany({ where: { id: { in: ids } } }),
            () => 'Erreur lors de la suppression des images'
        ).map(() => undefined);
    }
}

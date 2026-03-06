import { prisma } from "@/shared/lib/prisma";
import { ResultAsync } from "@/shared/lib/result";
import { GalleryImage } from '../../domain/models/gallery-image.model';

function mapToGalleryImage(img: {
    id: string;
    title: string;
    alt: string;
    category: string;
    publicId: string;
    version: number;
    format: string;
    width: number;
    height: number;
    bytes: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}): GalleryImage {
    return {
        id: img.id,
        title: img.title,
        alt: img.alt,
        category: img.category,
        asset: {
            publicId: img.publicId,
            version: img.version,
            format: img.format,
            width: img.width,
            height: img.height,
            bytes: img.bytes,
            resourceType: 'image',
        },
        order: img.order,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
    };
}

export class GalleryImagePostgresDataSource {

    getGalleryImages(): ResultAsync<GalleryImage[], string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.findMany({
                orderBy: { order: 'asc' },
            }),
            () => 'Erreur lors de la récupération des images'
        ).map((images) => images.map(mapToGalleryImage));
    }

    getGalleryImagesByCategory(category: string): ResultAsync<GalleryImage[], string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.findMany({
                where: { category },
                orderBy: { order: 'asc' },
            }),
            () => 'Erreur lors de la récupération des images par catégorie'
        ).map((images) => images.map(mapToGalleryImage));
    }

    getGalleryImageById(id: string): ResultAsync<GalleryImage | null, string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.findUnique({ where: { id } }),
            () => `Erreur lors de la récupération de l'image ${id}`
        ).map((img) => {
            if (!img) return null;
            return mapToGalleryImage(img);
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
                    publicId: image.asset.publicId,
                    version: image.asset.version,
                    format: image.asset.format,
                    width: image.asset.width,
                    height: image.asset.height,
                    bytes: image.asset.bytes,
                    order: image.order,
                    updatedAt: new Date(),
                },
                create: {
                    title: image.title,
                    alt: image.alt,
                    category: image.category,
                    publicId: image.asset.publicId,
                    version: image.asset.version,
                    format: image.asset.format,
                    width: image.asset.width,
                    height: image.asset.height,
                    bytes: image.asset.bytes,
                    order: image.order,
                },
            }),
            () => "Erreur lors de la sauvegarde de l'image"
        ).map(() => undefined);
    }

    createManyGalleryImages(images: GalleryImage[]): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.galleryImage.createMany({
                data: images.map((img) => ({
                    id: img.id,
                    title: img.title,
                    alt: img.alt,
                    category: img.category,
                    publicId: img.asset.publicId,
                    version: img.asset.version,
                    format: img.asset.format,
                    width: img.asset.width,
                    height: img.asset.height,
                    bytes: img.asset.bytes,
                    order: img.order,
                })),
            }),
            () => 'Erreur lors de la sauvegarde des images'
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

    reorderGalleryImages(items: { id: string; order: number }[]): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.$transaction(
                items.map((item) =>
                    prisma.galleryImage.update({
                        where: { id: item.id },
                        data: { order: item.order },
                    }),
                ),
            ),
            () => "Erreur lors de la réorganisation des images"
        ).map(() => undefined);
    }
}

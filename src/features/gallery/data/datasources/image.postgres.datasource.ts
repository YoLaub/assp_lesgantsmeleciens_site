import { prisma } from "@/shared/lib/prisma";
import { ResultAsync } from "@/shared/lib/result";
import { Image } from '../../domain/models/image.model';

const imageInclude = { category: true } as const;

type PrismaImageWithCategory = {
    id: string;
    title: string;
    alt: string;
    publicId: string;
    version: number;
    format: string;
    width: number;
    height: number;
    bytes: number;
    blurDataUrl: string;
    order: number;
    categoryId: string;
    category: { id: string; name: string; slug: string };
    createdAt: Date;
    updatedAt: Date;
};

function mapToImage(img: PrismaImageWithCategory): Image {
    return {
        id: img.id,
        title: img.title,
        alt: img.alt,
        publicId: img.publicId,
        version: img.version,
        format: img.format,
        width: img.width,
        height: img.height,
        bytes: img.bytes,
        blurDataUrl: img.blurDataUrl,
        order: img.order,
        category: img.category,
        categoryId: img.categoryId,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
    };
}

export class ImagePostgresDataSource {

    getImages(): ResultAsync<Image[], string> {
        return ResultAsync.fromPromise(
            prisma.image.findMany({
                orderBy: { order: 'asc' },
                include: imageInclude,
            }),
            () => 'Erreur lors de la récupération des images'
        ).map((images) => images.map(mapToImage));
    }

    getImagesByCategory(categorySlug: string): ResultAsync<Image[], string> {
        return ResultAsync.fromPromise(
            prisma.image.findMany({
                where: { category: { slug: categorySlug } },
                orderBy: { order: 'asc' },
                include: imageInclude,
            }),
            () => 'Erreur lors de la récupération des images par catégorie'
        ).map((images) => images.map(mapToImage));
    }

    getImageById(id: string): ResultAsync<Image | null, string> {
        return ResultAsync.fromPromise(
            prisma.image.findUnique({
                where: { id },
                include: imageInclude,
            }),
            () => `Erreur lors de la récupération de l'image ${id}`
        ).map((img) => {
            if (!img) return null;
            return mapToImage(img);
        });
    }

    getImagesByIds(ids: string[]): ResultAsync<Image[], string> {
        return ResultAsync.fromPromise(
            prisma.image.findMany({
                where: { id: { in: ids } },
                include: imageInclude,
            }),
            () => 'Erreur lors de la récupération des images par IDs'
        ).map((images) => images.map(mapToImage));
    }

    upsertImage(image: Image): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.image.upsert({
                where: { id: image.id || '' },
                update: {
                    title: image.title,
                    alt: image.alt,
                    categoryId: image.categoryId,
                    publicId: image.publicId,
                    version: image.version,
                    format: image.format,
                    width: image.width,
                    height: image.height,
                    bytes: image.bytes,
                    blurDataUrl: image.blurDataUrl,
                    order: image.order,
                    updatedAt: new Date(),
                },
                create: {
                    title: image.title,
                    alt: image.alt,
                    categoryId: image.categoryId,
                    publicId: image.publicId,
                    version: image.version,
                    format: image.format,
                    width: image.width,
                    height: image.height,
                    bytes: image.bytes,
                    blurDataUrl: image.blurDataUrl,
                    order: image.order,
                },
            }),
            () => "Erreur lors de la sauvegarde de l'image"
        ).map(() => undefined);
    }

    createManyImages(images: Image[]): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.image.createMany({
                data: images.map((img) => ({
                    id: img.id,
                    title: img.title,
                    alt: img.alt,
                    categoryId: img.categoryId,
                    publicId: img.publicId,
                    version: img.version,
                    format: img.format,
                    width: img.width,
                    height: img.height,
                    bytes: img.bytes,
                    blurDataUrl: img.blurDataUrl,
                    order: img.order,
                })),
            }),
            () => 'Erreur lors de la sauvegarde des images'
        ).map(() => undefined);
    }

    deleteImage(id: string): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.image.delete({ where: { id } }),
            () => "Erreur lors de la suppression de l'image"
        ).map(() => undefined);
    }

    bulkDeleteImages(ids: string[]): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.image.deleteMany({ where: { id: { in: ids } } }),
            () => 'Erreur lors de la suppression des images'
        ).map(() => undefined);
    }

    reorderImages(items: { id: string; order: number }[]): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.$transaction(
                items.map((item) =>
                    prisma.image.update({
                        where: { id: item.id },
                        data: { order: item.order },
                    }),
                ),
            ),
            () => "Erreur lors de la réorganisation des images"
        ).map(() => undefined);
    }
}

import { prisma } from "@/shared/lib/prisma";
import { Actualite } from '../../domain/models/actualite.model';
import { type Image } from '@/features/gallery/domain/models/image.model';

const imageInclude = {
    images: { include: { category: true }, orderBy: { order: 'asc' as const } },
} as const;

function mapToImage(img: {
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
}): Image {
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

function mapToActualite(a: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    active: boolean;
    featured: boolean;
    images: Parameters<typeof mapToImage>[0][];
    imageOrder: string[];
    seo: unknown;
    order: number;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}): Actualite {
    return {
        id: a.id,
        title: a.title,
        description: a.description,
        tags: a.tags,
        active: a.active,
        featured: a.featured,
        images: a.images.map(mapToImage),
        imageOrder: a.imageOrder,
        seo: (a.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
        order: a.order,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}

export class ActualitePostgresDataSource {

    async upsertActualite(actualite: Actualite): Promise<void> {
        const seoPayload = actualite.seo ?? { metaTitle: '', metaDescription: '' };
        const imageIds = actualite.imageOrder ?? actualite.images.map((i) => i.id);

        await prisma.actualite.upsert({
            where: { id: actualite.id || '' },
            update: {
                title: actualite.title,
                description: actualite.description,
                tags: actualite.tags,
                images: { set: [], connect: imageIds.map((id) => ({ id })) },
                imageOrder: imageIds,
                seo: seoPayload,
                active: actualite.active ?? true,
                featured: actualite.featured ?? false,
                order: actualite.order ?? 0,
                publishedAt: actualite.publishedAt ?? null,
                updatedAt: new Date(),
            },
            create: {
                title: actualite.title,
                description: actualite.description,
                tags: actualite.tags,
                images: { connect: imageIds.map((id) => ({ id })) },
                imageOrder: imageIds,
                seo: seoPayload,
                active: actualite.active ?? true,
                featured: actualite.featured ?? false,
                order: actualite.order ?? 0,
                publishedAt: actualite.publishedAt ?? null,
            },
        });
    }

    async getActualites(): Promise<Actualite[]> {
        const rows = await prisma.actualite.findMany({
            orderBy: { order: 'asc' },
            include: imageInclude,
        });
        return rows.map(mapToActualite);
    }

    async getActualiteById(id: string): Promise<Actualite | null> {
        const a = await prisma.actualite.findUnique({
            where: { id },
            include: imageInclude,
        });
        if (!a) return null;
        return mapToActualite(a);
    }

    async getActiveActualites(): Promise<Actualite[]> {
        const rows = await prisma.actualite.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
            include: imageInclude,
        });
        return rows.map(mapToActualite);
    }

    async getFeaturedActualite(): Promise<Actualite | null> {
        const a = await prisma.actualite.findFirst({
            where: { featured: true, active: true },
            orderBy: { createdAt: 'desc' },
            include: imageInclude,
        });
        if (!a) return null;
        return mapToActualite(a);
    }

    async reorderActualites(items: { id: string; order: number }[]): Promise<void> {
        await prisma.$transaction(
            items.map((item) =>
                prisma.actualite.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
    }

    async deleteActualite(id: string): Promise<void> {
        await prisma.actualite.delete({ where: { id } });
    }
}

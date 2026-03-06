import { prisma } from "@/shared/lib/prisma";
import { Actualite } from '../../domain/models/actualite.model';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';

function mapToActualite(a: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    active: boolean;
    featured: boolean;
    photos: unknown;
    seo: unknown;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}): Actualite {
    return {
        id: a.id,
        title: a.title,
        description: a.description,
        tags: a.tags,
        photos: (a.photos as CloudinaryAsset[]) ?? [],
        seo: (a.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
        active: a.active,
        featured: a.featured,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
    };
}

export class ActualitePostgresDataSource {

    async upsertActualite(actualite: Actualite): Promise<void> {
        const seoPayload = actualite.seo ?? { metaTitle: '', metaDescription: '' };
        await prisma.actualite.upsert({
            where: { id: actualite.id || '' },
            update: {
                title: actualite.title,
                description: actualite.description,
                tags: actualite.tags,
                photos: actualite.photos as unknown as object[],
                seo: seoPayload,
                active: actualite.active ?? true,
                featured: actualite.featured ?? false,
                publishedAt: actualite.publishedAt ?? null,
                updatedAt: new Date(),
            },
            create: {
                title: actualite.title,
                description: actualite.description,
                tags: actualite.tags,
                photos: actualite.photos as unknown as object[],
                seo: seoPayload,
                active: actualite.active ?? true,
                featured: actualite.featured ?? false,
                publishedAt: actualite.publishedAt ?? null,
            },
        });
    }

    async getActualites(): Promise<Actualite[]> {
        const rows = await prisma.actualite.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapToActualite);
    }

    async getActualiteById(id: string): Promise<Actualite | null> {
        const a = await prisma.actualite.findUnique({ where: { id } });
        if (!a) return null;
        return mapToActualite(a);
    }

    async getActiveActualites(): Promise<Actualite[]> {
        const rows = await prisma.actualite.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map(mapToActualite);
    }

    async getFeaturedActualite(): Promise<Actualite | null> {
        const a = await prisma.actualite.findFirst({
            where: { featured: true, active: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!a) return null;
        return mapToActualite(a);
    }

    async deleteActualite(id: string): Promise<void> {
        await prisma.actualite.delete({ where: { id } });
    }
}

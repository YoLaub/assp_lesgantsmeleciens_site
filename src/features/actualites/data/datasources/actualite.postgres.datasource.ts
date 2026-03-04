import { prisma } from "@/shared/lib/prisma";
import { Actualite } from '../../domain/models/actualite.model';

export class ActualitePostgresDataSource {

    private mapToActualite(a: {
        id: string;
        title: string;
        description: string;
        tags: string[];
        active: boolean;
        featured: boolean;
        photo: string[];
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
            photo: a.photo,
            seo: (a.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
            active: a.active,
            featured: a.featured,
            publishedAt: a.publishedAt,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
        };
    }

    async upsertActualite(actualite: Actualite): Promise<void> {
        const seoPayload = actualite.seo ?? { metaTitle: '', metaDescription: '' };
        await prisma.actualite.upsert({
            where: { id: actualite.id || '' },
            update: {
                title: actualite.title,
                description: actualite.description,
                tags: actualite.tags,
                photo: actualite.photo,
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
                photo: actualite.photo,
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
        return rows.map((a) => this.mapToActualite(a));
    }

    async getActualiteById(id: string): Promise<Actualite | null> {
        const a = await prisma.actualite.findUnique({ where: { id } });
        if (!a) return null;
        return this.mapToActualite(a);
    }

    async getActiveActualites(): Promise<Actualite[]> {
        const rows = await prisma.actualite.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((a) => this.mapToActualite(a));
    }

    async getFeaturedActualite(): Promise<Actualite | null> {
        const a = await prisma.actualite.findFirst({
            where: { featured: true, active: true },
            orderBy: { createdAt: 'desc' },
        });
        if (!a) return null;
        return this.mapToActualite(a);
    }

    async deleteActualite(id: string): Promise<void> {
        await prisma.actualite.delete({ where: { id } });
    }
}

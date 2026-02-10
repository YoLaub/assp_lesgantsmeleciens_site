import { prisma } from '@/shared/lib/prisma';
import { Discipline } from '../../domain/models/discipline.model';

export class DisciplinePostgresDataSource {
    async upsertDiscipline(data: Discipline): Promise<void> {
        await prisma.discipline.upsert({
            where: { id: data.id || 'new-id' },
            update: {
                title: data.title,
                coach: data.coach,
                category: data.category,
                description: data.description,
                tags: data.tags,
                active: data.active,
                photos: data.photos.filter((p): p is string => p !== null),
                metaTitle: data.seo.metaTitle,
                metaDescription: data.seo.metaDescription,
                order: data.order,
            },
            create: {
                title: data.title,
                coach: data.coach,
                category: data.category,
                description: data.description,
                tags: data.tags,
                active: data.active,
                photos: data.photos.filter((p): p is string => p !== null),
                metaTitle: data.seo.metaTitle,
                metaDescription: data.seo.metaDescription,
                order: data.order,
            },
        });
    }

    async getDisciplines(): Promise<Discipline[]> {
        const results = await prisma.discipline.findMany({
            orderBy: { order: 'asc' }
        });

        // Mapping Database -> Domain Entity
        return results.map(db => ({
            id: db.id,
            title: db.title,
            coach: db.coach,
            category: db.category,
            description: db.description,
            tags: db.tags,
            active: db.active,
            photos: db.photos,
            seo: {
                metaTitle: db.metaTitle || '',
                metaDescription: db.metaDescription || '',
            },
            order: db.order
        }));
    }
}
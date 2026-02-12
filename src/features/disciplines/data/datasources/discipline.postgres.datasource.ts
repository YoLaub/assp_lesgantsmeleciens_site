import {prisma} from "@/shared/lib/prisma";
import { Discipline } from '../../domain/models/discipline.model';

export class DisciplinePostgresDataSource {


    async upsertDiscipline(discipline: Discipline): Promise<void> {
        await prisma.discipline.upsert({
            where: { id: discipline.id || '' },
            update: {
                title: discipline.title,
                coach: discipline.coach,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                photo: discipline.photo,
                seo: discipline.seo,
                active: discipline.active ?? true,
                updatedAt: new Date(),
            },
            create: {
                title: discipline.title,
                coach: discipline.coach,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                photo: discipline.photo,
                seo: discipline.seo,
                active: discipline.active ?? true,
            },
        });
    }

    async getDisciplines(): Promise<Discipline[]> {
        const disciplines = await prisma.discipline.findMany({
            orderBy: { order: 'asc' },
        });

        return disciplines.map((d: any) => ({
            id: d.id,
            title: d.title,
            coach: d.coach,
            category: d.category,
            description: d.description,
            tags: d.tags,
            photo: d.photo,
            seo: d.seo as { metaTitle: string; metaDescription: string },
            active: d.active,
            order: d.order,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }

    async getDisciplineById(id: string): Promise<Discipline | null> {
        return prisma.discipline.findUnique({
            where: {id}
        });
    }
}
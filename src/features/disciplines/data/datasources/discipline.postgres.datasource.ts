import {prisma} from "@/shared/lib/prisma";
import { Discipline } from '../../domain/models/discipline.model';

export class DisciplinePostgresDataSource {


    async upsertDiscipline(discipline: Discipline): Promise<void> {
        await prisma.discipline.upsert({
            where: { id: discipline.id || '' },
            update: {
                title: discipline.title,
                coach: discipline.coach,
                photo_coach: discipline.photo_coach ?? null,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                photo: discipline.photo,
                seo: discipline.seo ? (discipline.seo) : { metaTitle: '', metaDescription: '' },
                active: discipline.active ?? true,
                citation: discipline.citation ?? '',
                updatedAt: new Date(),
            },
            create: {
                title: discipline.title,
                coach: discipline.coach,
                photo_coach: discipline.photo_coach ?? null,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                photo: discipline.photo,
                seo: discipline.seo ? (discipline.seo) : { metaTitle: '', metaDescription: '' },
                active: discipline.active ?? true,
                citation: discipline.citation ?? '',
            },
        });
    }

    async getDisciplines(): Promise<Discipline[]> {
        const disciplines = await prisma.discipline.findMany({
            orderBy: { order: 'asc' },
        });

        return disciplines.map((d) => ({
            id: d.id,
            title: d.title,
            coach: d.coach,
            photo_coach: d.photo_coach ?? undefined,
            category: d.category,
            description: d.description,
            tags: d.tags,
            photo: d.photo,
            seo: (d.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
            active: d.active,
            citation: d.citation ?? '',
            order: d.order,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }

    async getDisciplineById(id: string): Promise<Discipline | null> {
        const d = await prisma.discipline.findUnique({
            where: { id }
        });

        if (!d) return null;

        // C'est ICI qu'était ton erreur. On map proprement les données.
        return {
            ...d,
            photo_coach: d.photo_coach ?? undefined,
            seo: (d.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
            citation: d.citation ?? ''
        };
    }

    async getActiveDisciplines(): Promise<Discipline[]> {
        const disciplines = await prisma.discipline.findMany({
            where: { active: true }, // Sécurité : on ne montre pas les brouillons
            orderBy: { order: 'asc' },
        });

        return disciplines.map((d) => ({
            id: d.id,
            title: d.title,
            coach: d.coach,
            photo_coach: d.photo_coach ?? undefined,
            category: d.category,
            description: d.description,
            tags: d.tags,
            photo: d.photo,
            seo: (d.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
            active: d.active,
            citation:  d.citation ?? "",
            order: d.order,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
        }));
    }
}
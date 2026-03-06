import { prisma } from "@/shared/lib/prisma";
import { Discipline } from '../../domain/models/discipline.model';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';

function mapToDiscipline(d: {
    id: string;
    title: string;
    coach: string;
    category: string;
    citation: string | null;
    description: string;
    tags: string[];
    active: boolean;
    coachPhoto: unknown;
    photos: unknown;
    seo: unknown;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}): Discipline {
    return {
        id: d.id,
        title: d.title,
        coach: d.coach,
        coachPhoto: (d.coachPhoto as CloudinaryAsset | null) ?? null,
        category: d.category,
        description: d.description,
        tags: d.tags,
        photos: (d.photos as CloudinaryAsset[]) ?? [],
        seo: (d.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
        active: d.active,
        citation: d.citation ?? '',
        order: d.order,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
    };
}

export class DisciplinePostgresDataSource {

    async upsertDiscipline(discipline: Discipline): Promise<void> {
        await prisma.discipline.upsert({
            where: { id: discipline.id || '' },
            update: {
                title: discipline.title,
                coach: discipline.coach,
                coachPhoto: (discipline.coachPhoto ?? undefined) as object | undefined,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                photos: discipline.photos as unknown as object[],
                seo: discipline.seo ? (discipline.seo) : { metaTitle: '', metaDescription: '' },
                active: discipline.active ?? true,
                citation: discipline.citation ?? '',
                updatedAt: new Date(),
            },
            create: {
                title: discipline.title,
                coach: discipline.coach,
                coachPhoto: (discipline.coachPhoto ?? undefined) as object | undefined,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                photos: discipline.photos as unknown as object[],
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
        return disciplines.map(mapToDiscipline);
    }

    async getDisciplineById(id: string): Promise<Discipline | null> {
        const d = await prisma.discipline.findUnique({ where: { id } });
        if (!d) return null;
        return mapToDiscipline(d);
    }

    async getActiveDisciplines(): Promise<Discipline[]> {
        const disciplines = await prisma.discipline.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
        });
        return disciplines.map(mapToDiscipline);
    }
}

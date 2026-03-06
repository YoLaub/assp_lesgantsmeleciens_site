import { prisma } from "@/shared/lib/prisma";
import { Discipline } from '../../domain/models/discipline.model';
import { type Image } from '@/features/gallery/domain/models/image.model';

const disciplineInclude = {
    images: { include: { category: true }, orderBy: { order: 'asc' as const } },
    coachImage: { include: { category: true } },
} as const;

type PrismaImageRow = {
    id: string;
    title: string;
    alt: string;
    publicId: string;
    version: number;
    format: string;
    width: number;
    height: number;
    bytes: number;
    order: number;
    categoryId: string;
    category: { id: string; name: string; slug: string };
    createdAt: Date;
    updatedAt: Date;
};

function mapToImage(img: PrismaImageRow): Image {
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
        order: img.order,
        category: img.category,
        categoryId: img.categoryId,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt,
    };
}

function mapToDiscipline(d: {
    id: string;
    title: string;
    coach: string;
    category: string;
    citation: string | null;
    description: string;
    tags: string[];
    active: boolean;
    images: PrismaImageRow[];
    imageOrder: string[];
    coachImage: PrismaImageRow;
    coachImageId: string;
    seo: unknown;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}): Discipline {
    return {
        id: d.id,
        title: d.title,
        coach: d.coach,
        coachImage: mapToImage(d.coachImage),
        coachImageId: d.coachImageId,
        category: d.category,
        description: d.description,
        tags: d.tags,
        active: d.active,
        images: d.images.map(mapToImage),
        imageOrder: d.imageOrder,
        seo: (d.seo as { metaTitle: string; metaDescription: string }) || { metaTitle: '', metaDescription: '' },
        citation: d.citation,
        order: d.order,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
    };
}

export class DisciplinePostgresDataSource {

    async upsertDiscipline(discipline: Discipline): Promise<void> {
        const imageIds = discipline.imageOrder ?? discipline.images.map((i) => i.id);

        await prisma.discipline.upsert({
            where: { id: discipline.id || '' },
            update: {
                title: discipline.title,
                coach: discipline.coach,
                coachImageId: discipline.coachImageId,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                images: { set: [], connect: imageIds.map((id) => ({ id })) },
                imageOrder: imageIds,
                seo: discipline.seo ? discipline.seo : { metaTitle: '', metaDescription: '' },
                active: discipline.active ?? true,
                citation: discipline.citation ?? '',
                updatedAt: new Date(),
            },
            create: {
                title: discipline.title,
                coach: discipline.coach,
                coachImageId: discipline.coachImageId,
                category: discipline.category,
                description: discipline.description,
                tags: discipline.tags,
                images: { connect: imageIds.map((id) => ({ id })) },
                imageOrder: imageIds,
                seo: discipline.seo ? discipline.seo : { metaTitle: '', metaDescription: '' },
                active: discipline.active ?? true,
                citation: discipline.citation ?? '',
            },
        });
    }

    async getDisciplines(): Promise<Discipline[]> {
        const disciplines = await prisma.discipline.findMany({
            orderBy: { order: 'asc' },
            include: disciplineInclude,
        });
        return disciplines.map(mapToDiscipline);
    }

    async getDisciplineById(id: string): Promise<Discipline | null> {
        const d = await prisma.discipline.findUnique({
            where: { id },
            include: disciplineInclude,
        });
        if (!d) return null;
        return mapToDiscipline(d);
    }

    async getActiveDisciplines(): Promise<Discipline[]> {
        const disciplines = await prisma.discipline.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
            include: disciplineInclude,
        });
        return disciplines.map(mapToDiscipline);
    }
}

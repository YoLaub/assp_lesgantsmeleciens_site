import { prisma } from '@/shared/lib/prisma';
import { ResultAsync } from '@/shared/lib/result';
import {
    CoachToken,
    CreateEssayantData,
    Essayant,
    EssayantForCoach,
    PointPresenceData,
} from '../../domain/models/essayant.model';

function mapToEssayant(row: {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateDeNaissance: Date;
    nombrePresences: number;
    accesBloque: boolean;
    accesToken: string | null;
    accesTokenExpireLe: Date | null;
}): Essayant {
    return {
        id: row.id,
        numeroAdherent: row.numeroAdherent,
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        telephone: row.telephone,
        dateDeNaissance: row.dateDeNaissance,
        nombrePresences: row.nombrePresences,
        accesBloque: row.accesBloque,
        accesToken: row.accesToken,
        accesTokenExpireLe: row.accesTokenExpireLe,
    };
}

function mapToCoachToken(row: {
    id: number;
    token: string;
    expireLe: Date;
    creePar: string | null;
    creeLe: Date;
}): CoachToken {
    return {
        id: row.id,
        token: row.token,
        expireLe: row.expireLe,
        creePar: row.creePar,
        creeLe: row.creeLe,
    };
}

export class EssayantPostgresDataSource {
    createEssayant(data: CreateEssayantData): ResultAsync<Essayant, string> {
        return ResultAsync.fromPromise(
            prisma.essayant.create({ data }),
            () => "Erreur lors de la création de l'essayant",
        ).map(mapToEssayant);
    }

    findByToken(token: string): ResultAsync<Essayant | null, string> {
        return ResultAsync.fromPromise(
            prisma.essayant.findFirst({
                where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
            }),
            () => "Erreur lors de la recherche de l'essayant",
        ).map((row) => (row ? mapToEssayant(row) : null));
    }

    findById(id: number): ResultAsync<Essayant | null, string> {
        return ResultAsync.fromPromise(
            prisma.essayant.findUnique({ where: { id } }),
            () => "Erreur lors de la recherche de l'essayant",
        ).map((row) => (row ? mapToEssayant(row) : null));
    }

    findByEmailAndNumero(email: string, numero: string): ResultAsync<Essayant | null, string> {
        return ResultAsync.fromPromise(
            prisma.essayant.findFirst({ where: { email, numeroAdherent: numero } }),
            () => "Erreur lors de la recherche de l'essayant",
        ).map((row) => (row ? mapToEssayant(row) : null));
    }

    updateToken(id: number, token: string, expireLe: Date): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.essayant.update({
                where: { id },
                data: { accesToken: token, accesTokenExpireLe: expireLe },
            }),
            () => 'Erreur lors de la mise à jour du token',
        ).map(() => undefined);
    }

    pointPresence(essayantId: number, pointePar: string, data: PointPresenceData): ResultAsync<Essayant, string> {
        return ResultAsync.fromPromise(
            prisma.$transaction(async (tx) => {
                await tx.presenceEssai.create({ data: { essayantId, pointePar } });
                return tx.essayant.update({
                    where: { id: essayantId },
                    data: {
                        nombrePresences: data.nombrePresences,
                        accesBloque: data.accesBloque,
                        ...(data.newAccesToken
                            ? { accesToken: data.newAccesToken, accesTokenExpireLe: data.newAccesTokenExpireLe }
                            : {}),
                    },
                });
            }),
            () => 'Erreur lors du pointage de présence',
        ).map(mapToEssayant);
    }

    findAllNonConvertis(): ResultAsync<EssayantForCoach[], string> {
        return ResultAsync.fromPromise(
            prisma.essayant.findMany({
                where: { adherent: null },
                orderBy: { nom: 'asc' },
                select: {
                    id: true,
                    numeroAdherent: true,
                    nom: true,
                    prenom: true,
                    nombrePresences: true,
                    accesBloque: true,
                    presences: { orderBy: { pointeLe: 'desc' }, select: { pointeLe: true } },
                },
            }),
            () => 'Erreur lors de la récupération des essayants',
        ).map((rows) =>
            rows.map((row) => ({
                id: row.id,
                numeroAdherent: row.numeroAdherent,
                nom: row.nom,
                prenom: row.prenom,
                nombrePresences: row.nombrePresences,
                accesBloque: row.accesBloque,
                dernierePresenceLe: row.presences[0]?.pointeLe ?? null,
                presences: row.presences,
            })),
        );
    }

    createCoachToken(token: string, expireLe: Date, creePar: string): ResultAsync<CoachToken, string> {
        return ResultAsync.fromPromise(
            prisma.coachToken.create({ data: { token, expireLe, creePar } }),
            () => 'Erreur lors de la création du token coach',
        ).map(mapToCoachToken);
    }

    findCoachToken(token: string): ResultAsync<CoachToken | null, string> {
        return ResultAsync.fromPromise(
            prisma.coachToken.findFirst({ where: { token, expireLe: { gt: new Date() } } }),
            () => 'Erreur lors de la recherche du token coach',
        ).map((row) => (row ? mapToCoachToken(row) : null));
    }

    getLatestCoachToken(): ResultAsync<CoachToken | null, string> {
        return ResultAsync.fromPromise(
            prisma.coachToken.findFirst({ orderBy: { creeLe: 'desc' } }),
            () => 'Erreur lors de la récupération du token coach',
        ).map((row) => (row ? mapToCoachToken(row) : null));
    }
}

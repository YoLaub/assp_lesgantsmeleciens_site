import { prisma } from '@/shared/lib/prisma';
import { ResultAsync } from '@/shared/lib/result';
import { DocumentType as PrismaDocumentType } from '@/generated/prisma/enums';
import {
    Adherent,
    AdherentWithDetails,
    AdherentWithQuestionnaire,
    ConfigTarifs,
    CreateAdherentData,
    CreateConfigTarifsData,
    DocumentAdherent,
    DocumentType,
    PatchAdherentData,
    QuestionnaireReponses,
    StatutDocument,
} from '../../domain/models/adherent.model';

const withDetails = { questionnaire: true, documents: true } as const;
const withQuestionnaire = { questionnaire: true } as const;

type PrismaAdherent = {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    email: string;
    dateDeNaissance: Date;
    sexe: string;
    categorie: string;
    telephone1: string | null;
    telephone2: string | null;
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
    oxygene: boolean;
    renouvellement: boolean;
    reglementSigne: string;
    certificatMedical: string;
    certificatMedicalReq: boolean;
    autorisationParentale: string;
    couponSport: string;
    bonCaf: string;
    codePassSport: string | null;
    droitImage: boolean;
    engagementPrisConnaissance: boolean;
    montantSnapshot: { toNumber(): number } | null;
    typePaiement: string | null;
    inscriptionValide: boolean;
    stripeSessionId: string | null;
    accesToken: string | null;
    accesTokenExpireLe: Date | null;
    essayantId: number | null;
    fnsmr: boolean;
    dateInscription: Date;
};

function mapToAdherent(row: PrismaAdherent): Adherent {
    return {
        id: row.id,
        numeroAdherent: row.numeroAdherent,
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        dateDeNaissance: row.dateDeNaissance,
        sexe: row.sexe as Adherent['sexe'],
        categorie: row.categorie as Adherent['categorie'],
        telephone1: row.telephone1,
        telephone2: row.telephone2,
        adresse: row.adresse,
        codePostal: row.codePostal,
        ville: row.ville,
        oxygene: row.oxygene,
        renouvellement: row.renouvellement,
        reglementSigne: row.reglementSigne as Adherent['reglementSigne'],
        certificatMedical: row.certificatMedical as Adherent['certificatMedical'],
        certificatMedicalReq: row.certificatMedicalReq,
        autorisationParentale: row.autorisationParentale as Adherent['autorisationParentale'],
        couponSport: row.couponSport as Adherent['couponSport'],
        bonCaf: row.bonCaf as Adherent['bonCaf'],
        codePassSport: row.codePassSport,
        droitImage: row.droitImage,
        engagementPrisConnaissance: row.engagementPrisConnaissance,
        montantSnapshot: row.montantSnapshot ? row.montantSnapshot.toNumber() : null,
        typePaiement: row.typePaiement as Adherent['typePaiement'],
        inscriptionValide: row.inscriptionValide,
        stripeSessionId: row.stripeSessionId,
        accesToken: row.accesToken,
        accesTokenExpireLe: row.accesTokenExpireLe,
        essayantId: row.essayantId,
        fnsmr: row.fnsmr,
        dateInscription: row.dateInscription,
    };
}

function mapToAdherentWithDetails(row: PrismaAdherent & {
    questionnaire: { id: number; adherentId: number; q1: boolean; q2: boolean; q3: boolean; q4: boolean; q5: boolean; q6: boolean; q7: boolean; q8: boolean; q9: boolean } | null;
    documents: { id: string; adherentId: number; type: string; url: string; name: string | null }[];
}): AdherentWithDetails {
    return {
        ...mapToAdherent(row),
        questionnaire: row.questionnaire
            ? { ...row.questionnaire }
            : null,
        documents: row.documents.map((d) => ({
            id: d.id,
            adherentId: d.adherentId,
            type: d.type as DocumentType,
            url: d.url,
            name: d.name,
        })),
    };
}

function mapToConfigTarifs(row: {
    id: number;
    saison: string;
    tarifEnfant: { toNumber(): number };
    tarifAdos: { toNumber(): number };
    tarifAdulte: { toNumber(): number };
    supplementOxygene: { toNumber(): number };
    deductionCouponSport: { toNumber(): number };
    modifieLe: Date;
    modifiePar: string | null;
}): ConfigTarifs {
    return {
        id: row.id,
        saison: row.saison,
        tarifEnfant: row.tarifEnfant.toNumber(),
        tarifAdos: row.tarifAdos.toNumber(),
        tarifAdulte: row.tarifAdulte.toNumber(),
        supplementOxygene: row.supplementOxygene.toNumber(),
        deductionCouponSport: row.deductionCouponSport.toNumber(),
        modifieLe: row.modifieLe,
        modifiePar: row.modifiePar,
    };
}

export class AdherentPostgresDataSource {
    createAdherent(data: CreateAdherentData): ResultAsync<Adherent, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.create({
                data: {
                    numeroAdherent: data.numeroAdherent,
                    nom: data.nom,
                    prenom: data.prenom,
                    dateDeNaissance: data.dateDeNaissance,
                    sexe: data.sexe,
                    email: data.email,
                    ...(data.telephone1 ? { telephone1: data.telephone1 } : {}),
                    oxygene: data.oxygene,
                    categorie: data.categorie,
                    renouvellement: data.renouvellement,
                    couponSport: data.couponSport,
                    bonCaf: data.bonCaf,
                    ...(data.codePassSport ? { codePassSport: data.codePassSport } : {}),
                    montantSnapshot: data.montantSnapshot,
                    essayantId: data.essayantId,
                },
            }),
            () => "Erreur lors de la création de l'adhérent",
        ).map(mapToAdherent);
    }

    linkEssayant(adherentId: number, essayantId: number): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.essayant.update({
                where: { id: essayantId },
                data: { adherent: { connect: { id: adherentId } } },
            }),
            () => 'Erreur lors du lien essayant',
        ).map(() => undefined);
    }

    findByToken(token: string): ResultAsync<AdherentWithDetails | null, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.findFirst({
                where: { accesToken: token, accesTokenExpireLe: { gt: new Date() } },
                include: withDetails,
            }),
            () => "Erreur lors de la recherche de l'adhérent",
        ).map((row) => (row ? mapToAdherentWithDetails(row) : null));
    }

    findByEmail(email: string): ResultAsync<Adherent | null, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.findFirst({ where: { email, inscriptionValide: true } }),
            () => "Erreur lors de la recherche de l'adhérent",
        ).map((row) => (row ? mapToAdherent(row) : null));
    }

    findByEmailAndNumero(email: string, numero: string): ResultAsync<Adherent | null, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.findFirst({ where: { email, numeroAdherent: numero } }),
            () => "Erreur lors de la recherche de l'adhérent",
        ).map((row) => (row ? mapToAdherent(row) : null));
    }

    findAll(): ResultAsync<AdherentWithQuestionnaire[], string> {
        return ResultAsync.fromPromise(
            prisma.adherent.findMany({
                include: withQuestionnaire,
                orderBy: { dateInscription: 'desc' },
            }),
            () => 'Erreur lors de la récupération des adhérents',
        ).map((rows) =>
            rows.map((row) => ({
                ...mapToAdherent(row),
                questionnaire: row.questionnaire ? { ...row.questionnaire } : null,
            })),
        );
    }

    findById(id: number): ResultAsync<AdherentWithDetails | null, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.findUnique({ where: { id }, include: withDetails }),
            () => "Erreur lors de la recherche de l'adhérent",
        ).map((row) => (row ? mapToAdherentWithDetails(row) : null));
    }

    updateToken(id: number, token: string, expireLe: Date): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.update({
                where: { id },
                data: { accesToken: token, accesTokenExpireLe: expireLe },
            }),
            () => 'Erreur lors de la mise à jour du token',
        ).map(() => undefined);
    }

    patchAdherent(id: number, data: PatchAdherentData): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.adherent.update({ where: { id }, data }),
            () => "Erreur lors de la mise à jour de l'adhérent",
        ).map(() => undefined);
    }

    upsertQuestionnaire(
        adherentId: number,
        reponses: QuestionnaireReponses,
        certificatMedicalReq: boolean,
        certificatMedicalStatut: StatutDocument,
    ): ResultAsync<void, string> {
        return ResultAsync.fromPromise(
            prisma.$transaction(async (tx) => {
                const existing = await tx.questionnaireSanteReponses.findUnique({ where: { adherentId } });
                if (existing) {
                    await tx.questionnaireSanteReponses.update({ where: { adherentId }, data: reponses });
                } else {
                    await tx.questionnaireSanteReponses.create({ data: { adherentId, ...reponses } });
                }
                await tx.adherent.update({
                    where: { id: adherentId },
                    data: { certificatMedicalReq, certificatMedical: certificatMedicalStatut },
                });
            }),
            () => 'Erreur lors de la soumission du questionnaire',
        ).map(() => undefined);
    }

    saveDocument(adherentId: number, type: DocumentType, url: string, name: string): ResultAsync<DocumentAdherent, string> {
        const prismaType = PrismaDocumentType[type];
        return ResultAsync.fromPromise(
            prisma.$transaction(async (tx) => {
                await tx.document.deleteMany({ where: { adherentId, type: prismaType } });
                const doc = await tx.document.create({
                    data: { adherentId, type: prismaType, url, name },
                });
                if (type === 'MEDICAL_CERTIFICATE') {
                    await tx.adherent.update({
                        where: { id: adherentId },
                        data: { certificatMedical: 'declare' },
                    });
                }
                return doc;
            }),
            () => "Erreur lors de l'enregistrement du document",
        ).map((doc) => ({
            id: doc.id,
            adherentId: doc.adherentId,
            type: doc.type as DocumentType,
            url: doc.url,
            name: doc.name,
        }));
    }

    getConfigTarifs(): ResultAsync<ConfigTarifs | null, string> {
        return ResultAsync.fromPromise(
            prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } }),
            () => 'Erreur lors de la récupération de la configuration',
        ).map((row) => (row ? mapToConfigTarifs(row) : null));
    }

    createConfigTarifs(data: CreateConfigTarifsData): ResultAsync<ConfigTarifs, string> {
        return ResultAsync.fromPromise(
            prisma.configTarifs.create({ data }),
            () => 'Erreur lors de la création de la configuration',
        ).map(mapToConfigTarifs);
    }
}

import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { hashToken } from '@/shared/lib/token';

const INCLUDE_MEMBRE = { membre: true } as const;

const INCLUDE_FULL = {
  membre: true,
  presences: { orderBy: { pointeLe: 'asc' as const } },
  documents: true,
  questionnaire: {
    include: {
      reponses: { include: { question: true } },
    },
  },
} satisfies Prisma.InscriptionInclude;

export const inscriptionDataSource = {
  findById(id: number) {
    return prisma.inscription.findUnique({ where: { id }, include: INCLUDE_FULL });
  },

  findCurrentByMembreId(membreId: string) {
    return prisma.inscription.findFirst({
      where: { membreId },
      orderBy: { id: 'desc' },
    });
  },

  findByToken(token: string) {
    return prisma.inscription.findFirst({
      where: {
        membre: { accesToken: hashToken(token), accesTokenExpireLe: { gt: new Date() } },
      },
      include: INCLUDE_FULL,
    });
  },

  findByStripeSessionId(sessionId: string) {
    return prisma.inscription.findFirst({
      where: { stripeSessionId: sessionId },
      include: INCLUDE_MEMBRE,
    });
  },

  findAllEssayants() {
    return prisma.inscription.findMany({
      where: { statut: 'ESSAYANT' },
      include: {
        membre: true,
        presences: { orderBy: { pointeLe: 'desc' }, take: 1 },
      },
      orderBy: { id: 'desc' },
    });
  },

  findAllAdherents() {
    return prisma.inscription.findMany({
      where: { statut: { not: 'ESSAYANT' } },
      include: INCLUDE_MEMBRE,
      orderBy: { dateInscription: 'desc' },
    });
  },

  findAdherentById(id: number) {
    return prisma.inscription.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });
  },

  create(data: Prisma.InscriptionCreateInput) {
    return prisma.inscription.create({ data });
  },

  update(id: number, data: Prisma.InscriptionUpdateInput) {
    return prisma.inscription.update({ where: { id }, data });
  },

  updateMany(where: Prisma.InscriptionWhereInput, data: Prisma.InscriptionUpdateManyMutationInput) {
    return prisma.inscription.updateMany({ where, data });
  },

  createPresence(inscriptionId: number, pointePar: string) {
    return prisma.presenceEssai.create({ data: { inscriptionId, pointePar } });
  },

  deleteDocumentsByType(inscriptionId: number, type: string) {
    return prisma.document.deleteMany({ where: { inscriptionId, type } });
  },

  createDocument(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({ data });
  },

  findQuestionsByType(type: 'majeur' | 'mineur') {
    return prisma.question.findMany({
      where: { type },
      orderBy: { ordre: 'asc' },
    });
  },

  findQuestionnaire(inscriptionId: number) {
    return prisma.questionnaireSante.findUnique({
      where: { inscriptionId },
      include: { reponses: { include: { question: true } }, interroges: true },
    });
  },

  upsertQuestionnaire(inscriptionId: number, type: string, questionIds: number[], reponses: boolean[]) {
    return prisma.$transaction(async (tx) => {
      let questionnaire = await tx.questionnaireSante.findUnique({ where: { inscriptionId } });

      if (!questionnaire) {
        questionnaire = await tx.questionnaireSante.create({ data: { inscriptionId, type } });
        await tx.interroge.createMany({
          data: questionIds.map((questionId) => ({ questionnaireSanteId: questionnaire!.id, questionId })),
          skipDuplicates: true,
        });
      }

      for (let i = 0; i < questionIds.length; i++) {
        await tx.reponse.upsert({
          where: { questionnaireSanteId_questionId: { questionnaireSanteId: questionnaire.id, questionId: questionIds[i] } },
          update: { reponse: reponses[i] },
          create: { questionnaireSanteId: questionnaire.id, questionId: questionIds[i], reponse: reponses[i] },
        });
      }

      return questionnaire;
    });
  },

  updateQuestionsLabels(updates: { id: number; label: string }[]) {
    return prisma.$transaction(
      updates.map(({ id, label }) => prisma.question.update({ where: { id }, data: { label } }))
    );
  },

  getCurrentSaison() {
    return prisma.configTarifs.findFirst({ orderBy: { id: 'desc' }, select: { saison: true } });
  },

  getConfigTarifs() {
    return prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
  },
};

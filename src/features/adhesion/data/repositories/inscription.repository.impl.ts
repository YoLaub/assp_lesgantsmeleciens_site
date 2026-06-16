import type { IInscriptionRepository } from '@/features/adhesion/domain/repositories/inscription.repository';
import type {
  Inscription,
  InscriptionAvecMembre,
  InscriptionAvecDetails,
  CreateInscriptionData,
  PresenceEssai,
  DocumentAdhesion,
  QuestionnaireSante,
  QuestionSante,
  ReponseSante,
} from '@/features/adhesion/domain/models/inscription.model';
import type { Membre } from '@/features/adhesion/domain/models/membre.model';
import { inscriptionDataSource } from '../datasources/inscription.postgres.datasource';

// ─── Mappers ──────────────────────────────────────────────────────────────────

type RawFull = NonNullable<Awaited<ReturnType<typeof inscriptionDataSource.findById>>>;
type RawFlat = NonNullable<Awaited<ReturnType<typeof inscriptionDataSource.findCurrentByMembreId>>>;

function toMembre(raw: RawFull['membre']): Membre {
  return {
    id: raw.id,
    nom: raw.nom,
    prenom: raw.prenom,
    email: raw.email,
    telephone: raw.telephone,
    sexe: raw.sexe,
    codeInsee: raw.codeInsee,
    communeNom: raw.commune?.nom ?? null,
    codePostal: raw.codePostal,
    adresse: raw.adresse,
    dateDeNaissance: raw.dateDeNaissance,
    numeroAdherent: raw.numeroAdherent,
    accesToken: raw.accesToken,
    accesTokenExpireLe: raw.accesTokenExpireLe,
    dateCreation: raw.dateCreation,
  };
}

function toInscription(raw: RawFlat): Inscription {
  return {
    id: raw.id,
    statut: raw.statut as Inscription['statut'],
    photo: raw.photo,
    certificatMedical: raw.certificatMedical as Inscription['certificatMedical'],
    certificatMedicalReq: raw.certificatMedicalReq,
    engagementPrisConnaissance: raw.engagementPrisConnaissance,
    autorisationParentale: raw.autorisationParentale as Inscription['autorisationParentale'],
    autorisationSortieSeul: raw.autorisationSortieSeul,
    couponSport: raw.couponSport as Inscription['couponSport'],
    bonCaf: raw.bonCaf as Inscription['bonCaf'],
    codePassSport: raw.codePassSport,
    montantSnapshot: raw.montantSnapshot ? Number(raw.montantSnapshot) : null,
    inscriptionValide: raw.inscriptionValide,
    fnsmr: raw.fnsmr,
    droitImage: raw.droitImage,
    reglementSigne: raw.reglementSigne as Inscription['reglementSigne'],
    oxygene: raw.oxygene,
    renouvellement: raw.renouvellement,
    typePaiement: raw.typePaiement as Inscription['typePaiement'],
    accesBloque: raw.accesBloque,
    telephone2: raw.telephone2,
    stripeSessionId: raw.stripeSessionId,
    categorie: raw.categorie as Inscription['categorie'],
    nombrePresences: raw.nombrePresences,
    dateInscription: raw.dateInscription,
    saison: raw.saison,
    membreId: raw.membreId,
  };
}

function toQuestionnaire(raw: RawFull['questionnaire']): QuestionnaireSante | null {
  if (!raw) return null;
  return {
    id: raw.id,
    type: raw.type,
    reponses: raw.reponses.map((r): ReponseSante => ({
      questionId: r.questionId,
      reponse: r.reponse,
    })),
  };
}

function toDetails(raw: RawFull): InscriptionAvecDetails {
  return {
    ...toInscription(raw),
    membre: toMembre(raw.membre),
    presences: raw.presences.map((p): PresenceEssai => ({
      id: p.id,
      pointeLe: p.pointeLe,
      pointePar: p.pointePar,
      inscriptionId: p.inscriptionId,
    })),
    documents: raw.documents.map((d): DocumentAdhesion => ({
      id: d.id,
      type: d.type,
      name: d.name,
      url: d.url,
      createdAt: d.createdAt,
      inscriptionId: d.inscriptionId,
    })),
    questionnaire: toQuestionnaire(raw.questionnaire),
  };
}

function toAvecMembre(raw: RawFull): InscriptionAvecMembre {
  return { ...toInscription(raw), membre: toMembre(raw.membre) };
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const inscriptionRepository: IInscriptionRepository = {
  async findById(id) {
    const raw = await inscriptionDataSource.findById(id);
    return raw ? toDetails(raw) : null;
  },

  async findCurrentByMembreId(membreId) {
    const raw = await inscriptionDataSource.findCurrentByMembreId(membreId);
    return raw ? toInscription(raw) : null;
  },

  async findByToken(token) {
    const raw = await inscriptionDataSource.findByToken(token);
    return raw ? toDetails(raw) : null;
  },

  async findByStripeSessionId(sessionId) {
    const raw = await inscriptionDataSource.findByStripeSessionId(sessionId);
    return raw ? toAvecMembre(raw as RawFull) : null;
  },

  async findEssayantsByToken(token) {
    return this.findByToken(token);
  },

  async findAllEssayants() {
    const raws = await inscriptionDataSource.findAllEssayants();
    return raws.map((raw) => toAvecMembre(raw as RawFull));
  },

  async findAllAdherents() {
    const raws = await inscriptionDataSource.findAllAdherents();
    return raws.map((raw) => toAvecMembre(raw as RawFull));
  },

  async findAdherentById(id) {
    const raw = await inscriptionDataSource.findAdherentById(id);
    return raw ? toDetails(raw) : null;
  },

  async create(data: CreateInscriptionData) {
    const raw = await inscriptionDataSource.create({
      statut: data.statut,
      saison: data.saison,
      membre: { connect: { id: data.membreId } },
      ...(data.categorie ? { categorie: data.categorie } : {}),
      ...(data.oxygene !== undefined ? { oxygene: data.oxygene } : {}),
      ...(data.renouvellement !== undefined ? { renouvellement: data.renouvellement } : {}),
      ...(data.couponSport ? { couponSport: data.couponSport } : {}),
      ...(data.bonCaf ? { bonCaf: data.bonCaf } : {}),
      ...(data.codePassSport ? { codePassSport: data.codePassSport } : {}),
      ...(data.montantSnapshot !== undefined ? { montantSnapshot: data.montantSnapshot } : {}),
      ...(data.dateInscription ? { dateInscription: data.dateInscription } : {}),
    });
    return toInscription(raw as RawFlat);
  },

  async update(id, data) {
    const prismaData: Record<string, unknown> = { ...data };
    delete prismaData.id;
    delete prismaData.membreId;
    const raw = await inscriptionDataSource.update(id, prismaData);
    return toInscription(raw as RawFlat);
  },

  async createPresence(inscriptionId, pointePar) {
    const raw = await inscriptionDataSource.createPresence(inscriptionId, pointePar);
    return { id: raw.id, pointeLe: raw.pointeLe, pointePar: raw.pointePar, inscriptionId: raw.inscriptionId };
  },

  async deleteDocumentsByType(inscriptionId, type) {
    await inscriptionDataSource.deleteDocumentsByType(inscriptionId, type);
  },

  async createDocument(inscriptionId, type, url, name) {
    const raw = await inscriptionDataSource.createDocument({
      type,
      url,
      name,
      inscription: { connect: { id: inscriptionId } },
    });
    return { id: raw.id, type: raw.type, name: raw.name, url: raw.url, createdAt: raw.createdAt, inscriptionId: raw.inscriptionId };
  },

  async findQuestionsByType(type) {
    const raws = await inscriptionDataSource.findQuestionsByType(type);
    return raws.map((q): QuestionSante => ({ id: q.id, label: q.label, type: q.type, ordre: q.ordre, section: q.section }));
  },

  async upsertQuestionnaire(inscriptionId, type, reponses) {
    const questions = await inscriptionDataSource.findQuestionsByType(type);
    const questionIds = questions.map((q) => q.id);
    const reponsesArray = questions.map((_, i) => reponses[`q${i + 1}`] ?? false);
    await inscriptionDataSource.upsertQuestionnaire(inscriptionId, type, questionIds, reponsesArray);
  },

  async updateQuestionsLabels(updates) {
    await inscriptionDataSource.updateQuestionsLabels(updates);
  },

  async getCurrentSaison() {
    const config = await inscriptionDataSource.getCurrentSaison();
    if (!config?.saison) {
      const year = new Date().getFullYear();
      return `${year}-${year + 1}`;
    }
    return config.saison;
  },
};

import type {
  Inscription,
  InscriptionAvecMembre,
  InscriptionAvecDetails,
  CreateInscriptionData,
  PresenceEssai,
  DocumentAdhesion,
  QuestionnaireSante,
  QuestionSante,
  StatutDocument,
} from '../models/inscription.model';

export interface IInscriptionRepository {
  // Lecture
  findById(id: number): Promise<InscriptionAvecDetails | null>;
  findCurrentByMembreId(membreId: string): Promise<Inscription | null>;
  findByToken(token: string): Promise<InscriptionAvecDetails | null>;
  findByStripeSessionId(sessionId: string): Promise<InscriptionAvecMembre | null>;
  findEssayantsByToken(token: string): Promise<InscriptionAvecDetails | null>;
  findAllEssayants(): Promise<InscriptionAvecMembre[]>;
  findAllAdherents(): Promise<InscriptionAvecMembre[]>;
  findAdherentById(id: number): Promise<InscriptionAvecDetails | null>;

  // Écriture
  create(data: CreateInscriptionData): Promise<Inscription>;
  update(id: number, data: Partial<Inscription>): Promise<Inscription>;

  // Présences
  createPresence(inscriptionId: number, pointePar: string): Promise<PresenceEssai>;

  // Documents
  deleteDocumentsByType(inscriptionId: number, type: string): Promise<void>;
  createDocument(inscriptionId: number, type: string, url: string, name: string): Promise<DocumentAdhesion>;

  // Questionnaire
  findQuestionsByType(type: 'majeur' | 'mineur'): Promise<QuestionSante[]>;
  upsertQuestionnaire(inscriptionId: number, type: 'majeur' | 'mineur', reponses: Record<string, boolean>): Promise<void>;
  updateQuestionsLabels(updates: { id: number; label: string }[]): Promise<void>;

  // Config
  getCurrentSaison(): Promise<string>;
}

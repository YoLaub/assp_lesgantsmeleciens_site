import type { Membre } from './membre.model';

export type StatutInscription = 'ESSAYANT' | 'ACTIF' | 'BLOQUE' | 'ARCHIVE';
export type StatutDocument = 'non_fourni' | 'declare' | 'valide';
export type TypePaiement = 'sur_place' | 'en_ligne';
export type Categorie = 'enfant' | 'ados' | 'adulte';

export interface Inscription {
  id: number;
  statut: StatutInscription;
  photo: string | null;
  certificatMedical: StatutDocument;
  certificatMedicalReq: boolean;
  engagementPrisConnaissance: boolean;
  autorisationParentale: StatutDocument;
  /** Sortie seul (mineurs) : null = non répondu, true = autorisé, false = non autorisé. */
  autorisationSortieSeul: boolean | null;
  couponSport: StatutDocument;
  bonCaf: StatutDocument;
  codePassSport: string | null;
  montantSnapshot: number | null;
  inscriptionValide: boolean;
  fnsmr: boolean;
  droitImage: boolean;
  reglementSigne: StatutDocument;
  oxygene: boolean;
  renouvellement: boolean;
  typePaiement: TypePaiement | null;
  accesBloque: boolean;
  telephone2: string | null;
  stripeSessionId: string | null;
  categorie: Categorie | null;
  nombrePresences: number;
  dateInscription: Date | null;
  saison: string;
  membreId: string;
}

export interface PresenceEssai {
  id: number;
  pointeLe: Date;
  pointePar: string;
  inscriptionId: number;
}

export interface DocumentAdhesion {
  id: string;
  type: string;
  name: string | null;
  url: string;
  createdAt: Date;
  inscriptionId: number;
}

export interface QuestionSante {
  id: number;
  label: string;
  type: string;
  ordre: number;
  section: string | null;
}

export interface ReponseSante {
  questionId: number;
  reponse: boolean | null;
}

export interface QuestionnaireSante {
  id: number;
  type: string;
  reponses: ReponseSante[];
}

export interface InscriptionAvecMembre extends Inscription {
  membre: Membre;
}

export interface InscriptionAvecDetails extends InscriptionAvecMembre {
  presences: PresenceEssai[];
  documents: DocumentAdhesion[];
  questionnaire: QuestionnaireSante | null;
}

export interface CreateInscriptionData {
  statut: StatutInscription;
  saison: string;
  membreId: string;
  sexe?: string;
  categorie?: Categorie;
  telephone?: string;
  oxygene?: boolean;
  renouvellement?: boolean;
  couponSport?: StatutDocument;
  bonCaf?: StatutDocument;
  codePassSport?: string;
  montantSnapshot?: number;
  dateInscription?: Date;
}

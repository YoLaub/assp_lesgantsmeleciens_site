export type StatutDocument = 'non_fourni' | 'declare' | 'valide';
export type TypePaiement = 'sur_place' | 'en_ligne';
export type Categorie = 'enfant' | 'ados' | 'adulte';
export type Sexe = 'M' | 'F' | 'autre';
export type DocumentType = 'MEDICAL_CERTIFICATE' | 'ID_PHOTO';

export interface QuestionnaireSante {
    id: number;
    adherentId: number;
    q1: boolean;
    q2: boolean;
    q3: boolean;
    q4: boolean;
    q5: boolean;
    q6: boolean;
    q7: boolean;
    q8: boolean;
    q9: boolean;
}

export interface DocumentAdherent {
    id: string;
    adherentId: number;
    type: DocumentType;
    url: string;
    name: string | null;
}

export interface Adherent {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    email: string;
    dateDeNaissance: Date;
    sexe: Sexe;
    categorie: Categorie;
    telephone1: string | null;
    telephone2: string | null;
    adresse: string | null;
    codePostal: string | null;
    ville: string | null;
    oxygene: boolean;
    renouvellement: boolean;
    reglementSigne: StatutDocument;
    certificatMedical: StatutDocument;
    certificatMedicalReq: boolean;
    autorisationParentale: StatutDocument;
    couponSport: StatutDocument;
    bonCaf: StatutDocument;
    codePassSport: string | null;
    droitImage: boolean;
    engagementPrisConnaissance: boolean;
    montantSnapshot: number | null;
    typePaiement: TypePaiement | null;
    inscriptionValide: boolean;
    stripeSessionId: string | null;
    accesToken: string | null;
    accesTokenExpireLe: Date | null;
    essayantId: number | null;
    fnsmr: boolean;
    dateInscription: Date;
}

export interface AdherentWithDetails extends Adherent {
    questionnaire: QuestionnaireSante | null;
    documents: DocumentAdherent[];
}

export interface AdherentWithQuestionnaire extends Adherent {
    questionnaire: QuestionnaireSante | null;
}

export interface ConfigTarifs {
    id: number;
    saison: string;
    tarifEnfant: number;
    tarifAdos: number;
    tarifAdulte: number;
    supplementOxygene: number;
    deductionCouponSport: number;
    modifieLe: Date;
    modifiePar: string | null;
}

export interface CreateAdherentData {
    numeroAdherent: string;
    nom: string;
    prenom: string;
    dateDeNaissance: Date;
    sexe: Sexe;
    email: string;
    telephone1?: string;
    oxygene: boolean;
    categorie: Categorie;
    renouvellement: boolean;
    couponSport: StatutDocument;
    bonCaf: StatutDocument;
    codePassSport?: string;
    montantSnapshot: number;
    essayantId?: number;
}

export interface PatchAdherentData {
    reglementSigne?: StatutDocument;
    certificatMedical?: StatutDocument;
    certificatMedicalReq?: boolean;
    autorisationParentale?: StatutDocument;
    couponSport?: StatutDocument;
    bonCaf?: StatutDocument;
    inscriptionValide?: boolean;
    typePaiement?: TypePaiement;
    telephone1?: string;
    telephone2?: string | null;
    droitImage?: boolean;
    engagementPrisConnaissance?: boolean;
    fnsmr?: boolean;
    renouvellement?: boolean;
    stripeSessionId?: string;
    accesToken?: string;
    accesTokenExpireLe?: Date;
}

export interface QuestionnaireReponses {
    q1: boolean;
    q2: boolean;
    q3: boolean;
    q4: boolean;
    q5: boolean;
    q6: boolean;
    q7: boolean;
    q8: boolean;
    q9: boolean;
}

export interface CreateConfigTarifsData {
    saison: string;
    tarifEnfant: number;
    tarifAdos: number;
    tarifAdulte: number;
    supplementOxygene: number;
    deductionCouponSport: number;
    modifieLe: Date;
    modifiePar: string;
}

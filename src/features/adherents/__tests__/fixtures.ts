import { Adherent, AdherentWithDetails, ConfigTarifs, QuestionnaireSante } from '../domain/models/adherent.model';

export function makeConfigTarifs(overrides?: Partial<ConfigTarifs>): ConfigTarifs {
    return {
        id: 1,
        saison: '2025-2026',
        tarifEnfant: 80,
        tarifAdos: 100,
        tarifAdulte: 140,
        supplementOxygene: 40,
        deductionCouponSport: 50,
        ...overrides,
    };
}

export function makeAdherent(overrides?: Partial<Adherent>): Adherent {
    return {
        id: 1,
        numeroAdherent: 'ADH-001',
        nom: 'Dupont',
        prenom: 'Marie',
        email: 'marie.dupont@example.com',
        dateDeNaissance: new Date('1990-05-10'),
        sexe: 'F',
        categorie: 'adulte',
        telephone1: '0600000001',
        telephone2: null,
        oxygene: false,
        renouvellement: false,
        reglementSigne: 'non_fourni',
        certificatMedical: 'non_fourni',
        certificatMedicalReq: false,
        autorisationParentale: 'non_fourni',
        couponSport: 'non_fourni',
        bonCaf: 'non_fourni',
        codePassSport: null,
        droitImage: false,
        engagementPrisConnaissance: false,
        montantSnapshot: 140,
        typePaiement: null,
        inscriptionValide: false,
        stripeSessionId: null,
        accesToken: 'access-token-uuid',
        accesTokenExpireLe: new Date(Date.now() + 60 * 60 * 1000),
        essayantId: null,
        fnsmr: false,
        dateInscription: new Date(),
        ...overrides,
    };
}

export function makeAdherentWithDetails(overrides?: Partial<AdherentWithDetails>): AdherentWithDetails {
    return {
        ...makeAdherent(),
        questionnaire: null,
        documents: [],
        ...overrides,
    };
}

export function makeQuestionnaire(overrides?: Partial<QuestionnaireSante>): QuestionnaireSante {
    return {
        id: 1,
        adherentId: 1,
        q1: false,
        q2: false,
        q3: false,
        q4: false,
        q5: false,
        q6: false,
        q7: false,
        q8: false,
        q9: false,
        ...overrides,
    };
}

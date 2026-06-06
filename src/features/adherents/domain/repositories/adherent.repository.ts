import { ResultAsync } from '@/shared/lib/result';
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
} from '../models/adherent.model';

export interface AdherentRepository {
    createAdherent(data: CreateAdherentData): ResultAsync<Adherent, string>;
    linkEssayant(adherentId: number, essayantId: number): ResultAsync<void, string>;

    findByToken(token: string): ResultAsync<AdherentWithDetails | null, string>;
    findByEmail(email: string): ResultAsync<Adherent | null, string>;
    findByEmailAndNumero(email: string, numero: string): ResultAsync<Adherent | null, string>;
    findAll(): ResultAsync<AdherentWithQuestionnaire[], string>;
    findById(id: number): ResultAsync<AdherentWithDetails | null, string>;

    updateToken(id: number, token: string, expireLe: Date): ResultAsync<void, string>;
    patchAdherent(id: number, data: PatchAdherentData): ResultAsync<void, string>;
    upsertQuestionnaire(
        adherentId: number,
        reponses: QuestionnaireReponses,
        certificatMedicalReq: boolean,
        certificatMedicalStatut: StatutDocument,
    ): ResultAsync<void, string>;

    saveDocument(
        adherentId: number,
        type: DocumentType,
        url: string,
        name: string,
    ): ResultAsync<DocumentAdherent, string>;

    getConfigTarifs(): ResultAsync<ConfigTarifs | null, string>;
    createConfigTarifs(data: CreateConfigTarifsData): ResultAsync<ConfigTarifs, string>;
}

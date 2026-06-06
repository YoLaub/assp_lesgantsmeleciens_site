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
} from '../../domain/models/adherent.model';
import { AdherentRepository } from '../../domain/repositories/adherent.repository';
import { AdherentPostgresDataSource } from '../datasources/adherent.postgres.datasource';

export class AdherentRepositoryImpl implements AdherentRepository {
    private dataSource: AdherentPostgresDataSource;

    constructor() {
        this.dataSource = new AdherentPostgresDataSource();
    }

    createAdherent(data: CreateAdherentData): ResultAsync<Adherent, string> {
        return this.dataSource.createAdherent(data);
    }

    linkEssayant(adherentId: number, essayantId: number): ResultAsync<void, string> {
        return this.dataSource.linkEssayant(adherentId, essayantId);
    }

    findByToken(token: string): ResultAsync<AdherentWithDetails | null, string> {
        return this.dataSource.findByToken(token);
    }

    findByEmail(email: string): ResultAsync<Adherent | null, string> {
        return this.dataSource.findByEmail(email);
    }

    findByEmailAndNumero(email: string, numero: string): ResultAsync<Adherent | null, string> {
        return this.dataSource.findByEmailAndNumero(email, numero);
    }

    findAll(): ResultAsync<AdherentWithQuestionnaire[], string> {
        return this.dataSource.findAll();
    }

    findById(id: number): ResultAsync<AdherentWithDetails | null, string> {
        return this.dataSource.findById(id);
    }

    updateToken(id: number, token: string, expireLe: Date): ResultAsync<void, string> {
        return this.dataSource.updateToken(id, token, expireLe);
    }

    patchAdherent(id: number, data: PatchAdherentData): ResultAsync<void, string> {
        return this.dataSource.patchAdherent(id, data);
    }

    upsertQuestionnaire(
        adherentId: number,
        reponses: QuestionnaireReponses,
        certificatMedicalReq: boolean,
        certificatMedicalStatut: StatutDocument,
    ): ResultAsync<void, string> {
        return this.dataSource.upsertQuestionnaire(adherentId, reponses, certificatMedicalReq, certificatMedicalStatut);
    }

    saveDocument(adherentId: number, type: DocumentType, url: string, name: string): ResultAsync<DocumentAdherent, string> {
        return this.dataSource.saveDocument(adherentId, type, url, name);
    }

    getConfigTarifs(): ResultAsync<ConfigTarifs | null, string> {
        return this.dataSource.getConfigTarifs();
    }

    createConfigTarifs(data: CreateConfigTarifsData): ResultAsync<ConfigTarifs, string> {
        return this.dataSource.createConfigTarifs(data);
    }
}

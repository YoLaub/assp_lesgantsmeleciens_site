import { ResultAsync } from '@/shared/lib/result';
import { DocumentAdherent, DocumentType } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class SaveDocumentAdherentUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherentId: number, type: DocumentType, url: string, name: string): ResultAsync<DocumentAdherent, string> {
        return this.repository.saveDocument(adherentId, type, url, name);
    }
}

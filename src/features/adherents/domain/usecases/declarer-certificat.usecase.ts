import { ResultAsync, errAsync } from '@/shared/lib/result';
import { AdherentRepository } from '../repositories/adherent.repository';

export class DeclarerCertificatUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(adherentId: number, certificatMedicalReq: boolean): ResultAsync<void, string> {
        if (!certificatMedicalReq) return errAsync('Certificat non requis');
        return this.repository.patchAdherent(adherentId, { certificatMedical: 'declare' });
    }
}

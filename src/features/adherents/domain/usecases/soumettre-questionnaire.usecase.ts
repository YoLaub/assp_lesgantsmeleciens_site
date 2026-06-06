import { ResultAsync, errAsync } from '@/shared/lib/result';
import { QuestionnaireReponses, StatutDocument } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export interface SoumettreQuestionnaireResult {
    certificatMedicalReq: boolean;
}

export class SoumettreQuestionnaireUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(
        adherentId: number,
        reponses: QuestionnaireReponses,
        certificatMedicalActuel: StatutDocument,
    ): ResultAsync<SoumettreQuestionnaireResult, string> {
        const { q1, q2, q3, q4, q5, q6, q7, q8, q9 } = reponses;
        const certificatMedicalReq = [q1, q2, q3, q4, q5, q6, q7, q8, q9].some(Boolean);

        const certificatMedicalStatut = certificatMedicalReq
            ? certificatMedicalActuel
            : 'non_fourni';

        return this.repository
            .upsertQuestionnaire(adherentId, reponses, certificatMedicalReq, certificatMedicalStatut)
            .map(() => ({ certificatMedicalReq }));
    }
}

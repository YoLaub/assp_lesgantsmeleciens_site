import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import { CONSENT_SANTE } from '@/shared/lib/consent';

export async function soumettreQuestionnaireUseCase(
  inscriptionId: number,
  type: 'majeur' | 'mineur',
  reponses: Record<string, boolean>
) {
  const certificatMedicalReq = Object.values(reponses).some(Boolean);
  await inscriptionRepository.upsertQuestionnaire(inscriptionId, type, reponses, {
    le: new Date(),
    version: CONSENT_SANTE.version,
  });
  await inscriptionRepository.update(inscriptionId, {
    certificatMedicalReq,
    certificatMedical: certificatMedicalReq ? undefined : 'non_fourni',
  } as Parameters<typeof inscriptionRepository.update>[1]);
  return { certificatMedicalReq };
}

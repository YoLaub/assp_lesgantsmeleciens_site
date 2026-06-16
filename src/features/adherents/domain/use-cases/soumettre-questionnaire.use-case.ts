import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function soumettreQuestionnaireUseCase(
  inscriptionId: number,
  type: 'majeur' | 'mineur',
  reponses: Record<string, boolean>
) {
  const certificatMedicalReq = Object.values(reponses).some(Boolean);
  await inscriptionRepository.upsertQuestionnaire(inscriptionId, type, reponses);
  await inscriptionRepository.update(inscriptionId, {
    certificatMedicalReq,
    certificatMedical: certificatMedicalReq ? undefined : 'non_fourni',
  } as Parameters<typeof inscriptionRepository.update>[1]);
  return { certificatMedicalReq };
}

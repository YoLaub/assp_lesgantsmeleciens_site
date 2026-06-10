import { uploadDocumentFile } from '@/shared/lib/upload';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';

export async function uploadDocumentAdherentUseCase(
  inscriptionId: number,
  file: File,
  type: string
) {
  const { url } = await uploadDocumentFile(file, 'documents', type);

  await inscriptionRepository.deleteDocumentsByType(inscriptionId, type);
  await inscriptionRepository.createDocument(inscriptionId, type, url, file.name);

  if (type === 'MEDICAL_CERTIFICATE') {
    await inscriptionRepository.update(inscriptionId, { certificatMedical: 'declare' });
  }

  return url;
}

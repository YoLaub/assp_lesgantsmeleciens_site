import { prisma } from '@/shared/lib/prisma';
import { deleteR2Object } from '@/shared/lib/upload';
import { deleteCloudinaryAssetByUrl } from '@/shared/lib/cloudinary.server';

const TYPES_SANTE = ['MEDICAL_CERTIFICATE', 'ID_PHOTO'] as const;

/**
 * Purge RGPD des données de santé pour les inscriptions données :
 * supprime les fichiers (R2 certificat, Cloudinary photo), les questionnaires
 * (cascade réponses) et les documents, puis réinitialise les champs santé.
 * Best-effort sur les fichiers ; la suppression en base est la garantie.
 */
export async function purgerDonneesSanteSaison(inscriptionIds: number[]) {
  if (inscriptionIds.length === 0) return { questionnairesPurges: 0, documentsPurges: 0 };

  const inscriptions = await prisma.inscription.findMany({
    where: { id: { in: inscriptionIds } },
    select: { id: true, documents: { select: { type: true, url: true } } },
  });

  let documentsPurges = 0;
  for (const insc of inscriptions) {
    for (const doc of insc.documents) {
      if (doc.type !== 'MEDICAL_CERTIFICATE' && doc.type !== 'ID_PHOTO') continue;
      documentsPurges++;
      try {
        if (doc.type === 'MEDICAL_CERTIFICATE') await deleteR2Object(doc.url);
        else await deleteCloudinaryAssetByUrl(doc.url);
      } catch (e) {
        console.error('[purgerDonneesSanteSaison] suppression fichier', doc.url, e);
      }
    }
  }

  const q = await prisma.questionnaireSante.deleteMany({ where: { inscriptionId: { in: inscriptionIds } } });
  await prisma.document.deleteMany({ where: { inscriptionId: { in: inscriptionIds }, type: { in: [...TYPES_SANTE] } } });
  await prisma.inscription.updateMany({
    where: { id: { in: inscriptionIds } },
    data: { photo: null, certificatMedical: 'non_fourni', certificatMedicalReq: false },
  });

  return { questionnairesPurges: q.count, documentsPurges };
}

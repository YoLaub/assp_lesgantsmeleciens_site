import imageCompression from 'browser-image-compression';

/**
 * Compresse une image côté client avant upload (photo d'identité, certificat
 * médical photographié…). Les photos de smartphone font souvent 3–10 Mo : sans
 * compression, l'upload mobile est lent (impression de blocage) ou dépasse la
 * limite serveur. Après compression, l'image fait typiquement ~200–500 Ko.
 *
 * - Ne touche QUE les images (`image/*`). Un PDF (certificat scanné) est renvoyé
 *   tel quel.
 * - L'orientation EXIF est préservée (selfies de téléphone souvent pivotés).
 * - En cas d'échec de compression, on renvoie le fichier original : on ne bloque
 *   jamais l'utilisateur à cause de la compression.
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    try {
        const compressed = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1600,
            useWebWorker: true,
            preserveExif: true,
            // Conserve le type d'origine (jpeg/png/webp) accepté côté serveur.
            fileType: file.type,
        });

        // Sécurité : si la compression a paradoxalement grossi le fichier
        // (petites images déjà optimisées), on garde l'original.
        return compressed.size < file.size ? compressed : file;
    } catch (err) {
        console.error('[compressImageIfNeeded] échec, envoi de l’original', err);
        return file;
    }
}

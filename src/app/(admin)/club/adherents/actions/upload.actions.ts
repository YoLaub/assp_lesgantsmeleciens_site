'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadDocumentAction(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        throw new Error("Aucun fichier trouvé");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom de fichier unique pour éviter d'écraser d'autres fichiers
    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const path = join(process.cwd(), 'public/uploads', uniqueName);

    // Écriture du fichier sur le serveur (pour le développement)
    // Plus tard, tu remplaceras ça par un upload vers S3 ou Cloudinary
    await writeFile(path, buffer);

    // On retourne l'URL publique
    return `/uploads/${uniqueName}`;
}
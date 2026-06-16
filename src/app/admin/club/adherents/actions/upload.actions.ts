'use server';

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialisation de la connexion sécurisée vers Cloudflare R2
const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function uploadDocumentAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: "Aucun fichier fourni", fileKey: null };
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Nom de fichier propre et unique
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileKey = `certificats/${Date.now()}-${safeFilename}`;

        // Envoi vers le bucket Cloudflare Privé
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(command);

        // On retourne un objet avec le succès et la clé du fichier (le chemin S3)
        return { success: true, fileKey: fileKey, error: null };

    } catch (error) {
        console.error("Erreur critique lors de l'upload R2:", error);
        return { success: false, error: "Impossible de sauvegarder le document sur le serveur sécurisé.", fileKey: null };
    }
}
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    url: string;
    width: number;
    height: number;
}

export async function uploadPublicImage(file: File, subFolder: string): Promise<CloudinaryUploadResult> {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Astuce Next.js Serverless : On convertit le buffer en Base64 pour Cloudinary
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // Upload vers Cloudinary dans le dossier spécifié
    const response = await cloudinary.uploader.upload(fileUri, {
        folder: `gants-meleciens/${subFolder}`, // Ex: gants-meleciens/disciplines
        resource_type: 'auto',
    });

    return {
        url: response.secure_url,
        width: response.width,
        height: response.height,
    };
}
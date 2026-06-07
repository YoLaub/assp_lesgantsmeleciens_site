import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';
import { generateBlurBase64 } from '@/shared/lib/cloudinary.server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Cloudflare R2 (certificats médicaux — stockage privé) ───────────────────

function getR2Client() {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
        },
    });
}

async function uploadToR2(file: File, key: string): Promise<{ url: string }> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const r2 = getR2Client();
    const bucket = process.env.R2_BUCKET_NAME ?? '';

    await r2.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    }));

    // URL publique du bucket R2 (domaine personnalisé ou URL r2.dev)
    const publicBase = process.env.R2_PUBLIC_URL ?? `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`;
    return { url: `${publicBase}/${key}` };
}

// ─── Upload document adhérent ─────────────────────────────────────────────────

export async function uploadDocumentFile(
    file: File,
    subFolder: string,
    documentType?: string,
): Promise<{ url: string }> {
    if (documentType === 'MEDICAL_CERTIFICATE') {
        const ext = file.name.split('.').pop() ?? 'bin';
        const key = `gants-meleciens/${subFolder}/${Date.now()}.${ext}`;
        return uploadToR2(file, key);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    const response = await cloudinary.uploader.upload(fileUri, {
        folder: `gants-meleciens/${subFolder}`,
        resource_type: 'auto',
    });

    return { url: response.secure_url };
}

// ─── Upload image publique (galerie, disciplines, actualités) ─────────────────

export async function uploadPublicImage(file: File, subFolder: string): Promise<CloudinaryAsset & { blurDataUrl: string }> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    const response = await cloudinary.uploader.upload(fileUri, {
        folder: `gants-meleciens/${subFolder}`,
        resource_type: 'image',
    });

    const asset: CloudinaryAsset = {
        publicId: response.public_id,
        version: response.version,
        format: response.format,
        width: response.width,
        height: response.height,
        bytes: response.bytes,
        resourceType: response.resource_type,
    };

    const blurDataUrl = await generateBlurBase64(asset);

    return { ...asset, blurDataUrl };
}

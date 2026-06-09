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

function getR2Client(endpoint: string, accessKeyId: string, secretAccessKey: string) {
    return new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
        // AWS SDK v3 envoie des headers checksum par défaut non supportés par R2
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
    });
}

async function uploadToR2(file: File, key: string): Promise<{ url: string }> {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
        throw new Error('Variables R2 manquantes (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const r2 = getR2Client(endpoint, accessKeyId, secretAccessKey);

    try {
        await r2.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));
    } catch (err: unknown) {
        const e = err as { name?: string; $metadata?: { httpStatusCode?: number }; Code?: string; message?: string };
        const detail = `R2 PutObject échoué — name:${e?.name} code:${e?.Code} status:${e?.$metadata?.httpStatusCode} msg:${e?.message} bucket:${bucket} endpoint:${endpoint}`;
        throw new Error(detail);
    }

    const publicBase = process.env.R2_PUBLIC_URL ?? '';
    if (!publicBase) throw new Error('Variable R2_PUBLIC_URL manquante');
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

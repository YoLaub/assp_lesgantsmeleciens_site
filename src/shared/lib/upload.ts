import { v2 as cloudinary } from 'cloudinary';
import { type CloudinaryAsset } from '@/shared/types/cloudinary';
import { generateBlurBase64 } from '@/shared/lib/cloudinary.server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
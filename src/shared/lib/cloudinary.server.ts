import { v2 as cloudinary } from 'cloudinary'
import { type CloudinaryAsset } from '@/shared/types/cloudinary'
import { buildBlurUrl } from '@/shared/lib/cloudinary'

/**
 * Fetch the tiny Cloudinary blur image and return it as an inline base64 data URI.
 * Use at upload time so the placeholder is stored in DB — zero runtime network requests.
 * Returns empty string on failure so the upload still succeeds (CloudImage falls back to URL blur).
 */
export async function generateBlurBase64(asset: CloudinaryAsset): Promise<string> {
    try {
        const url = buildBlurUrl(asset)
        const response = await fetch(url)
        if (!response.ok) return ''
        const buffer = Buffer.from(await response.arrayBuffer())
        const contentType = response.headers.get('content-type') || 'image/webp'
        return `data:${contentType};base64,${buffer.toString('base64')}`
    } catch {
        return ''
    }
}

export async function deleteCloudinaryAsset(asset: CloudinaryAsset): Promise<void> {
    await cloudinary.uploader.destroy(asset.publicId)
}

export async function deleteCloudinaryAssets(assets: CloudinaryAsset[]): Promise<void> {
    const publicIds = assets.map(a => a.publicId)
    await cloudinary.api.delete_resources(publicIds)
}

/** Déduit le public_id Cloudinary (folder/name sans version ni extension) d'une secure_url. */
export function cloudinaryPublicIdFromUrl(url: string): string | null {
    const marker = '/upload/';
    const i = url.indexOf(marker);
    if (i === -1) return null;
    let path = url.slice(i + marker.length);
    path = path.replace(/^v\d+\//, '');           // retire le segment version éventuel
    path = path.replace(/\.[^/.]+$/, '');          // retire l'extension
    return path || null;
}

/** Supprime un asset Cloudinary par URL (best-effort). Loggue et ignore en cas d'échec. */
export async function deleteCloudinaryAssetByUrl(url: string): Promise<void> {
    const publicId = cloudinaryPublicIdFromUrl(url);
    if (!publicId) {
        console.error('[deleteCloudinaryAssetByUrl] public_id introuvable pour', url);
        return;
    }
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (e) {
        console.error('[deleteCloudinaryAssetByUrl]', url, e);
    }
}

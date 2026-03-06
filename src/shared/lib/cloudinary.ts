import { v2 as cloudinary } from 'cloudinary'
import { type CloudinaryAsset } from '@/shared/types/cloudinary'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

/**
 * Build a Cloudinary delivery URL from stored metadata.
 * Only needed when you can't use CldImage (e.g. og:image meta tags, emails).
 */
export function buildCloudinaryUrl(
    asset: CloudinaryAsset,
    transformations: string[] = []
): string {
    const txPart = transformations.length > 0
        ? transformations.join(',') + '/'
        : ''
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${txPart}v${asset.version}/${asset.publicId}.${asset.format}`
}

/**
 * Build a tiny blur placeholder URL — ~300 bytes, instant load.
 */
export function buildBlurUrl(asset: CloudinaryAsset): string {
    return buildCloudinaryUrl(asset, ['w_30', 'e_blur:1000', 'q_1', 'f_auto'])
}

/**
 * Convert an Image-like object (flat Cloudinary fields) to a CloudinaryAsset.
 * Use when passing Image data to CloudImage or buildBlurUrl.
 */
export function toCloudinaryAsset(img: {
    publicId: string
    version: number
    format: string
    width: number
    height: number
    bytes: number
}): CloudinaryAsset {
    return {
        publicId: img.publicId,
        version: img.version,
        format: img.format,
        width: img.width,
        height: img.height,
        bytes: img.bytes,
        resourceType: 'image',
    }
}

export async function deleteCloudinaryAsset(asset: CloudinaryAsset): Promise<void> {
    await cloudinary.uploader.destroy(asset.publicId)
}

export async function deleteCloudinaryAssets(assets: CloudinaryAsset[]): Promise<void> {
    const publicIds = assets.map(a => a.publicId)
    await cloudinary.api.delete_resources(publicIds)
}

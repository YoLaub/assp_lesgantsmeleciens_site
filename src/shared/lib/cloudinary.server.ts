import { v2 as cloudinary } from 'cloudinary'
import { type CloudinaryAsset } from '@/shared/types/cloudinary'

export async function deleteCloudinaryAsset(asset: CloudinaryAsset): Promise<void> {
    await cloudinary.uploader.destroy(asset.publicId)
}

export async function deleteCloudinaryAssets(assets: CloudinaryAsset[]): Promise<void> {
    const publicIds = assets.map(a => a.publicId)
    await cloudinary.api.delete_resources(publicIds)
}

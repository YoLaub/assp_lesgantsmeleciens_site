/** What Cloudinary returns at upload time — store ALL of this. */
export interface CloudinaryAsset {
    publicId: string       // e.g. "gants-meleciens/gallery/abc123"
    version: number        // e.g. 1719307544
    format: string         // e.g. "jpg", "webp", "png"
    width: number          // original pixel width
    height: number         // original pixel height
    bytes: number          // file size in bytes
    resourceType: string   // "image" (or "video" if ever needed)
}

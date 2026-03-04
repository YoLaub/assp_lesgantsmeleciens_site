export function isCloudinaryUrl(src: string): boolean {
    return src.includes('res.cloudinary.com');
}

/**
 * Transforms a Cloudinary URL into a tiny blurred thumbnail URL (~300 bytes).
 * Inserts `w_30,e_blur:1000,q_1` after `/upload/` in the URL.
 */
export function getCloudinaryBlurUrl(src: string): string {
    if (!isCloudinaryUrl(src)) return '';
    const uploadMarker = '/upload/';
    const idx = src.indexOf(uploadMarker);
    if (idx === -1) return '';
    const before = src.slice(0, idx + uploadMarker.length);
    const after = src.slice(idx + uploadMarker.length);
    return `${before}w_30,e_blur:1000,q_1/${after}`;
}

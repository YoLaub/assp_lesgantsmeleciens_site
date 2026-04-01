import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
    // Block elements
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre', 'hr', 'br',
    // Lists
    'ul', 'ol', 'li',
    // Inline formatting
    'strong', 'em', 'code', 's', 'u',
    // Links
    'a',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Sanitize HTML produced by the TipTap rich-text editor.
 * Uses DOMPurify with a strict allowlist matching TipTap StarterKit output.
 */
export function sanitizeRichText(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
    });
}

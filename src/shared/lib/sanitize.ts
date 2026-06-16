import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre', 'hr', 'br',
    'ul', 'ol', 'li',
    'strong', 'em', 'code', 's', 'u',
    'a',
];

/**
 * Sanitize HTML produced by the TipTap rich-text editor.
 * Strict allowlist matching TipTap StarterKit output.
 */
export function sanitizeRichText(dirty: string): string {
    return sanitizeHtml(dirty, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: {
            a: ['href', 'target', 'rel', 'class'],
            '*': ['class'],
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
        allowProtocolRelative: false,
        disallowedTagsMode: 'discard',
    });
}

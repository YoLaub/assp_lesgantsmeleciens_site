import { describe, it, expect } from 'vitest';
import { sanitizeRichText } from './sanitize';

describe('sanitizeRichText', () => {
    it('preserves valid TipTap HTML', () => {
        const html = '<h2>Title</h2><p>Hello <strong>world</strong></p>';
        expect(sanitizeRichText(html)).toBe(html);
    });

    it('strips script tags', () => {
        const dirty = '<p>Hello</p><script>alert("xss")</script>';
        expect(sanitizeRichText(dirty)).toBe('<p>Hello</p>');
    });

    it('strips event handlers', () => {
        const dirty = '<p onmouseover="alert(1)">Hover</p>';
        expect(sanitizeRichText(dirty)).toBe('<p>Hover</p>');
    });

    it('strips javascript: URIs from links', () => {
        const dirty = '<a href="javascript:alert(1)">Click</a>';
        const result = sanitizeRichText(dirty);
        expect(result).not.toContain('javascript:');
    });

    it('allows safe links with href', () => {
        const html = '<a href="https://example.com">Link</a>';
        const result = sanitizeRichText(html);
        expect(result).toContain('href="https://example.com"');
    });

    it('strips img tags', () => {
        const dirty = '<p>Text</p><img src="x" onerror="alert(1)">';
        expect(sanitizeRichText(dirty)).toBe('<p>Text</p>');
    });

    it('strips iframe tags', () => {
        const dirty = '<iframe src="https://evil.com"></iframe><p>Safe</p>';
        expect(sanitizeRichText(dirty)).toBe('<p>Safe</p>');
    });

    it('strips style attributes', () => {
        const dirty = '<p style="background:url(javascript:alert(1))">Text</p>';
        expect(sanitizeRichText(dirty)).toBe('<p>Text</p>');
    });

    it('preserves list structures', () => {
        const html = '<ul><li>One</li><li>Two</li></ul>';
        expect(sanitizeRichText(html)).toBe(html);
    });

    it('preserves code blocks with class', () => {
        const html = '<pre><code class="language-js">const x = 1;</code></pre>';
        expect(sanitizeRichText(html)).toBe(html);
    });

    it('preserves inline formatting', () => {
        const html = '<p><em>italic</em> <s>strike</s> <u>underline</u></p>';
        expect(sanitizeRichText(html)).toBe(html);
    });

    it('handles empty string', () => {
        expect(sanitizeRichText('')).toBe('');
    });

    it('strips data attributes', () => {
        const dirty = '<p data-custom="evil">Text</p>';
        expect(sanitizeRichText(dirty)).toBe('<p>Text</p>');
    });
});

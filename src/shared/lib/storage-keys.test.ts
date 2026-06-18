import { describe, it, expect } from 'vitest';
import { r2KeyFromUrl } from './upload';
import { cloudinaryPublicIdFromUrl } from './cloudinary.server';

describe('r2KeyFromUrl', () => {
  it('extrait la clé après le préfixe public', () => {
    expect(r2KeyFromUrl('https://pub-x.r2.dev/gants-meleciens/certs/123.pdf', 'https://pub-x.r2.dev'))
      .toBe('gants-meleciens/certs/123.pdf');
  });
  it('renvoie null si l’URL ne correspond pas au préfixe', () => {
    expect(r2KeyFromUrl('https://autre.example/x.pdf', 'https://pub-x.r2.dev')).toBeNull();
  });
  it('renvoie null si préfixe vide', () => {
    expect(r2KeyFromUrl('https://pub-x.r2.dev/a.pdf', '')).toBeNull();
  });
});

describe('cloudinaryPublicIdFromUrl', () => {
  it('extrait folder/name sans version ni extension', () => {
    expect(cloudinaryPublicIdFromUrl('https://res.cloudinary.com/demo/image/upload/v1699999999/gants-meleciens/photos/abc.jpg'))
      .toBe('gants-meleciens/photos/abc');
  });
  it('gère l’absence de segment version', () => {
    expect(cloudinaryPublicIdFromUrl('https://res.cloudinary.com/demo/image/upload/gants-meleciens/photos/abc.png'))
      .toBe('gants-meleciens/photos/abc');
  });
  it('renvoie null si pas un URL cloudinary upload', () => {
    expect(cloudinaryPublicIdFromUrl('https://example.com/x.jpg')).toBeNull();
  });
});

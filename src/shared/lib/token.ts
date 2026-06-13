import crypto from 'crypto';

/**
 * Hash SHA-256 (hex) d'un token. Le token brut n'est jamais stocké :
 * on stocke hashToken(brut) en base, et on compare hashToken(entrant) à la lecture.
 */
export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

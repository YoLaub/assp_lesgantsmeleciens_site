import { describe, it, expect } from 'vitest';
import { CONSENT_SANTE } from './consent';

describe('CONSENT_SANTE', () => {
  it('expose une version courte non vide', () => {
    expect(CONSENT_SANTE.version).toMatch(/^\S.{0,18}\S$/);
  });

  it('mentionne le fondement légal et la durée de conservation', () => {
    expect(CONSENT_SANTE.texte).toContain('9.2.a');
    expect(CONSENT_SANTE.texte.toLowerCase()).toContain('1 an');
  });
});

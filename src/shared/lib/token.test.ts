// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { hashToken } from './token';

describe('hashToken', () => {
  it('est déterministe : même entrée → même sortie', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
  });

  it('produit un hash hexadécimal de 64 caractères (SHA-256)', () => {
    expect(hashToken('abc')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produit des sorties différentes pour des entrées différentes', () => {
    expect(hashToken('abc')).not.toBe(hashToken('abd'));
  });
});

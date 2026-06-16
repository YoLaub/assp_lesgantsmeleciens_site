import { describe, it, expect } from 'vitest';
import { escapeCsvField, toCsv } from './csv';

describe('escapeCsvField', () => {
    it('laisse les valeurs simples telles quelles', () => {
        expect(escapeCsvField('Dupont')).toBe('Dupont');
        expect(escapeCsvField(42)).toBe('42');
    });

    it('rend les null/undefined comme chaîne vide', () => {
        expect(escapeCsvField(null)).toBe('');
        expect(escapeCsvField(undefined)).toBe('');
    });

    it('entoure de guillemets quand le séparateur est présent', () => {
        expect(escapeCsvField('Boxe; anglaise')).toBe('"Boxe; anglaise"');
    });

    it('double les guillemets internes', () => {
        expect(escapeCsvField('Jean "JJ" Dupont')).toBe('"Jean ""JJ"" Dupont"');
    });

    it('entoure de guillemets quand un saut de ligne est présent', () => {
        expect(escapeCsvField('ligne1\nligne2')).toBe('"ligne1\nligne2"');
    });
});

describe('toCsv', () => {
    it('commence par un BOM UTF-8', () => {
        expect(toCsv(['a'], [])).toMatch(/^﻿/);
    });

    it('joint en-têtes et lignes avec ; et CRLF', () => {
        const csv = toCsv(['Nom', 'Âge'], [['Dupont', 30], ['Martin', 25]]);
        expect(csv).toBe('﻿Nom;Âge\r\nDupont;30\r\nMartin;25');
    });

    it('échappe les champs problématiques dans les lignes', () => {
        const csv = toCsv(['Note'], [['a;b'], ['c"d']]);
        expect(csv).toBe('﻿Note\r\n"a;b"\r\n"c""d"');
    });
});

// Génération de CSV compatible Excel (FR) : séparateur ';' + BOM UTF-8 pour
// que les accents s'affichent correctement.

const DELIMITER = ';';
const BOM = '﻿';

export function escapeCsvField(value: unknown): string {
    const s = value === null || value === undefined ? '' : String(value);
    // Un champ contenant le séparateur, un guillemet ou un saut de ligne doit
    // être entouré de guillemets, les guillemets internes étant doublés.
    if (s.includes(DELIMITER) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export type CsvCell = string | number | boolean | null | undefined;

export function toCsv(headers: string[], rows: CsvCell[][]): string {
    const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(DELIMITER));
    // BOM UTF-8 pour qu'Excel reconnaisse l'encodage et affiche les accents.
    return BOM + lines.join('\r\n');
}

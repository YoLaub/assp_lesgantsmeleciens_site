import crypto from 'crypto';
import { prisma } from './prisma';
import { Categorie } from '@/generated/prisma/enums';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export async function genererNumeroAdherentUnique(): Promise<string> {
    let numero: string;
    let exists: boolean;

    do {
        const bytes = crypto.randomBytes(5);
        const suffix = Array.from(bytes)
            .map((b) => CHARS[b % CHARS.length])
            .join('');
        numero = `ADH-${suffix}`;

        const found = await prisma.adherent.findUnique({ where: { numeroAdherent: numero } });
        exists = found !== null;
    } while (exists);

    return numero;
}

export async function genererNumeroEssayantUnique(): Promise<string> {
    let numero: string;
    let exists: boolean;

    do {
        const bytes = crypto.randomBytes(5);
        const suffix = Array.from(bytes)
            .map((b) => CHARS[b % CHARS.length])
            .join('');
        numero = `ADH-${suffix}`;

        const foundAdherent = await prisma.adherent.findUnique({ where: { numeroAdherent: numero } });
        const foundEssayant = await prisma.essayant.findUnique({ where: { numeroAdherent: numero } });
        exists = foundAdherent !== null || foundEssayant !== null;
    } while (exists);

    return numero;
}

export function calculerCategorie(dateDeNaissance: Date): Categorie {
    const today = new Date();
    let age = today.getFullYear() - dateDeNaissance.getFullYear();
    const moisDiff = today.getMonth() - dateDeNaissance.getMonth();
    if (moisDiff < 0 || (moisDiff === 0 && today.getDate() < dateDeNaissance.getDate())) {
        age--;
    }

    if (age < 12) return Categorie.enfant;
    if (age < 18) return Categorie.ados;
    return Categorie.adulte;
}

export interface Essayant {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateDeNaissance: Date;
    nombrePresences: number;
    accesBloque: boolean;
    accesToken: string | null;
    accesTokenExpireLe: Date | null;
}

export interface EssayantForCoach {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    nombrePresences: number;
    accesBloque: boolean;
    dernierePresenceLe: Date | null;
    presences: { pointeLe: Date }[];
}

export interface CoachToken {
    id: number;
    token: string;
    expireLe: Date;
    creePar: string | null;
    creeLe: Date;
}

export interface CreateEssayantData {
    numeroAdherent: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateDeNaissance: Date;
    accesToken: string;
    accesTokenExpireLe: Date;
}

export interface PointPresenceData {
    nombrePresences: number;
    accesBloque: boolean;
    newAccesToken?: string;
    newAccesTokenExpireLe?: Date;
}

export interface Membre {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  sexe: string | null;
  ville: string | null;
  codePostal: string | null;
  adresse: string | null;
  dateDeNaissance: Date;
  numeroAdherent: string | null;
  accesToken: string | null;
  accesTokenExpireLe: Date | null;
  dateCreation: Date;
}

export interface CreateMembreData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateDeNaissance: Date;
  numeroAdherent: string;
  accesToken: string;
  accesTokenExpireLe: Date;
}

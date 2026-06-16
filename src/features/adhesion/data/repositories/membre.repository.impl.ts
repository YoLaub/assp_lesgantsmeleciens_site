import crypto from 'crypto';
import type { IMembreRepository } from '@/features/adhesion/domain/repositories/membre.repository';
import type { Membre, CreateMembreData } from '@/features/adhesion/domain/models/membre.model';
import { membreDataSource } from '../datasources/membre.postgres.datasource';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function toMembre(raw: NonNullable<Awaited<ReturnType<typeof membreDataSource.findById>>>): Membre {
  return {
    id: raw.id,
    nom: raw.nom,
    prenom: raw.prenom,
    email: raw.email,
    telephone: raw.telephone,
    sexe: raw.sexe,
    codeInsee: raw.codeInsee,
    communeNom: raw.commune?.nom ?? null,
    codePostal: raw.codePostal,
    adresse: raw.adresse,
    dateDeNaissance: raw.dateDeNaissance,
    numeroAdherent: raw.numeroAdherent,
    accesToken: raw.accesToken,
    accesTokenExpireLe: raw.accesTokenExpireLe,
    dateCreation: raw.dateCreation,
  };
}

export const membreRepository: IMembreRepository = {
  async findById(id) {
    const raw = await membreDataSource.findById(id);
    return raw ? toMembre(raw) : null;
  },

  async findByEmail(email) {
    const raw = await membreDataSource.findByEmail(email);
    return raw ? toMembre(raw) : null;
  },

  async findByToken(token) {
    const raw = await membreDataSource.findByToken(token);
    return raw ? toMembre(raw) : null;
  },

  async findByEmailAndNumero(email, numeroAdherent) {
    const raw = await membreDataSource.findByEmailAndNumero(email, numeroAdherent);
    return raw ? toMembre(raw) : null;
  },

  async findAllWithInscription() {
    return [];
  },

  async create(data: CreateMembreData) {
    const raw = await membreDataSource.create({
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone,
      dateDeNaissance: data.dateDeNaissance,
      numeroAdherent: data.numeroAdherent,
      accesToken: data.accesToken,
      accesTokenExpireLe: data.accesTokenExpireLe,
    });
    return toMembre(raw);
  },

  async updateToken(id, token, expireLe) {
    await membreDataSource.update(id, { accesToken: token, accesTokenExpireLe: expireLe });
  },

  async generateUniqueNumero() {
    let numero: string;
    let exists: boolean;
    do {
      const bytes = crypto.randomBytes(5);
      const suffix = Array.from(bytes).map((b) => CHARS[b % CHARS.length]).join('');
      numero = `ADH-${suffix}`;
      const found = await membreDataSource.findUniqueNumero(numero);
      exists = found !== null;
    } while (exists);
    return numero;
  },
};

import type { Membre, CreateMembreData } from '../models/membre.model';

export interface IMembreRepository {
  findById(id: string): Promise<Membre | null>;
  findByEmail(email: string): Promise<Membre | null>;
  findByToken(token: string): Promise<Membre | null>;
  findByEmailAndNumero(email: string, numeroAdherent: string): Promise<Membre | null>;
  findAllWithInscription(): Promise<Membre[]>;
  create(data: CreateMembreData): Promise<Membre>;
  updateToken(id: string, token: string, expireLe: Date): Promise<void>;
  generateUniqueNumero(): Promise<string>;
}

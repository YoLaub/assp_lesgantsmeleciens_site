import { Inscription } from "../models/inscriptions.model";

export interface InscriptionsRepository {
    save(adherent: Inscription): Promise<Inscription>;
    getById(id: string): Promise<Inscription | null>;
    getAll(): Promise<Inscription[]>;
    updateStatus(id: string, status: string): Promise<void>;
}
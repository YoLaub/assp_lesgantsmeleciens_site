import { Actualite } from "@/features/actualites/domain/models/actualite.model";

export interface ActualiteRepository {
    getById(id: string): Promise<Actualite | null>;
    getAll(): Promise<Actualite[]>;
    save(actualite: Actualite): Promise<void>;
    delete(id: string): Promise<void>;
    getAllActive(): Promise<Actualite[]>;
    getFeatured(): Promise<Actualite | null>;
    reorderMany(items: { id: string; order: number }[]): Promise<void>;
}

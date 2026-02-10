import {Discipline} from "@/features/disciplines/domain/models/discipline.model";
export interface DisciplineRepository {
    getById(id: string): Promise<Discipline | null>;
    getAll(): Promise<Discipline[]>;
    save(discipline: Discipline): Promise<void>;
    delete(id: string): Promise<void>;
}
import { ResultAsync } from '@/shared/lib/result';
import {
    CoachToken,
    CreateEssayantData,
    Essayant,
    EssayantForCoach,
    PointPresenceData,
} from '../models/essayant.model';

export interface EssayantRepository {
    createEssayant(data: CreateEssayantData): ResultAsync<Essayant, string>;
    findByToken(token: string): ResultAsync<Essayant | null, string>;
    findById(id: number): ResultAsync<Essayant | null, string>;
    findByEmailAndNumero(email: string, numero: string): ResultAsync<Essayant | null, string>;
    updateToken(id: number, token: string, expireLe: Date): ResultAsync<void, string>;
    pointPresence(essayantId: number, pointePar: string, data: PointPresenceData): ResultAsync<Essayant, string>;
    findAllNonConvertis(): ResultAsync<EssayantForCoach[], string>;
    createCoachToken(token: string, expireLe: Date, creePar: string): ResultAsync<CoachToken, string>;
    findCoachToken(token: string): ResultAsync<CoachToken | null, string>;
    getLatestCoachToken(): ResultAsync<CoachToken | null, string>;
}

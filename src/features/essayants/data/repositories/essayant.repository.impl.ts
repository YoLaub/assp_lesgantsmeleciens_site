import { ResultAsync } from '@/shared/lib/result';
import { CoachToken, CreateEssayantData, Essayant, EssayantForCoach, PointPresenceData } from '../../domain/models/essayant.model';
import { EssayantRepository } from '../../domain/repositories/essayant.repository';
import { EssayantPostgresDataSource } from '../datasources/essayant.postgres.datasource';

export class EssayantRepositoryImpl implements EssayantRepository {
    private dataSource: EssayantPostgresDataSource;

    constructor() {
        this.dataSource = new EssayantPostgresDataSource();
    }

    createEssayant(data: CreateEssayantData): ResultAsync<Essayant, string> {
        return this.dataSource.createEssayant(data);
    }

    findByToken(token: string): ResultAsync<Essayant | null, string> {
        return this.dataSource.findByToken(token);
    }

    findById(id: number): ResultAsync<Essayant | null, string> {
        return this.dataSource.findById(id);
    }

    findByEmailAndNumero(email: string, numero: string): ResultAsync<Essayant | null, string> {
        return this.dataSource.findByEmailAndNumero(email, numero);
    }

    updateToken(id: number, token: string, expireLe: Date): ResultAsync<void, string> {
        return this.dataSource.updateToken(id, token, expireLe);
    }

    pointPresence(essayantId: number, pointePar: string, data: PointPresenceData): ResultAsync<Essayant, string> {
        return this.dataSource.pointPresence(essayantId, pointePar, data);
    }

    findAllNonConvertis(): ResultAsync<EssayantForCoach[], string> {
        return this.dataSource.findAllNonConvertis();
    }

    createCoachToken(token: string, expireLe: Date, creePar: string): ResultAsync<CoachToken, string> {
        return this.dataSource.createCoachToken(token, expireLe, creePar);
    }

    findCoachToken(token: string): ResultAsync<CoachToken | null, string> {
        return this.dataSource.findCoachToken(token);
    }

    getLatestCoachToken(): ResultAsync<CoachToken | null, string> {
        return this.dataSource.getLatestCoachToken();
    }
}

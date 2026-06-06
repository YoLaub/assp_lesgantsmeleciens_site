import { ResultAsync, errAsync } from '@/shared/lib/result';
import { ConfigTarifs, CreateConfigTarifsData } from '../models/adherent.model';
import { AdherentRepository } from '../repositories/adherent.repository';

export class CreateConfigTarifsUseCase {
    constructor(private repository: AdherentRepository) {}

    execute(data: Omit<CreateConfigTarifsData, 'modifieLe' | 'modifiePar'>, userId: string): ResultAsync<ConfigTarifs, string> {
        if (!data.saison?.trim()) return errAsync('La saison est requise');
        if (data.tarifEnfant <= 0 || data.tarifAdulte <= 0) return errAsync('Les tarifs doivent être positifs');

        return this.repository.createConfigTarifs({
            ...data,
            modifieLe: new Date(),
            modifiePar: userId,
        });
    }
}

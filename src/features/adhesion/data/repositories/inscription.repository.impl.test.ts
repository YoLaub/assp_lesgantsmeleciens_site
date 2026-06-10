// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockFindMany = vi.hoisted(() => vi.fn());
const mockFindFirst = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockGetCurrentSaison = vi.hoisted(() => vi.fn().mockResolvedValue({ saison: '2025-2026' }));
const mockFindQuestionsByType = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock('@/features/adhesion/data/datasources/inscription.postgres.datasource', () => ({
    inscriptionDataSource: {
        findAllEssayants: mockFindMany,
        findByToken: mockFindFirst,
        create: mockCreate,
        update: mockUpdate,
        getCurrentSaison: mockGetCurrentSaison,
        findQuestionsByType: mockFindQuestionsByType,
    },
}));

import { inscriptionRepository } from './inscription.repository.impl';

describe('inscriptionRepository.getCurrentSaison', () => {
    it('retourne la saison depuis config', async () => {
        mockGetCurrentSaison.mockResolvedValue({ saison: '2025-2026' });
        const saison = await inscriptionRepository.getCurrentSaison();
        expect(saison).toBe('2025-2026');
    });
});

describe('inscriptionRepository.findAllEssayants', () => {
    beforeEach(() => vi.clearAllMocks());

    it('retourne une liste vide si aucun essayant', async () => {
        mockFindMany.mockResolvedValue([]);
        const result = await inscriptionRepository.findAllEssayants();
        expect(result).toEqual([]);
    });

    it('mappe correctement les champs depuis Prisma', async () => {
        mockFindMany.mockResolvedValue([{
            id: 1, statut: 'ESSAYANT', nombrePresences: 1, accesBloque: false,
            photo: null, certificatMedical: 'non_fourni', certificatMedicalReq: false,
            engagementPrisConnaissance: false, autorisationParentale: 'non_fourni',
            couponSport: 'non_fourni', bonCaf: 'non_fourni', codePassSport: null,
            montantSnapshot: null, inscriptionValide: false, fnsmr: false, droitImage: false,
            reglementSigne: 'non_fourni', oxygene: false, renouvellement: false,
            typePaiement: null, telephone2: null, stripeSessionId: null, categorie: null,
            dateInscription: null, saison: '2025-2026', membreId: 'uuid-1',
            membre: { id: 'uuid-1', nom: 'Martin', prenom: 'Alice', email: 'a@test.fr', telephone: null, sexe: null, ville: null, codePostal: null, adresse: null, dateDeNaissance: new Date('1990-01-01'), numeroAdherent: 'ADH-AAA', accesToken: null, accesTokenExpireLe: null, dateCreation: new Date() },
            presences: [],
        }]);
        const result = await inscriptionRepository.findAllEssayants();
        expect(result).toHaveLength(1);
        expect(result[0].membre.nom).toBe('Martin');
        expect(result[0].nombrePresences).toBe(1);
    });
});

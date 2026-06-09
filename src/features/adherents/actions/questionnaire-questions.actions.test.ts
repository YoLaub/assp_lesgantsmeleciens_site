// @vitest-environment node
import { vi } from 'vitest';

const mockFindMany = vi.hoisted(() => vi.fn());
const mockTransaction = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());
const mockAuth = vi.hoisted(() => vi.fn());
const mockFindManyEnfant = vi.hoisted(() => vi.fn());
const mockUpdateEnfant = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
    prisma: {
        questionnaireSanteQuestion: {
            findMany: mockFindMany,
            update: mockUpdate,
        },
        questionnaireSanteQuestionEnfant: {
            findMany: mockFindManyEnfant,
            update: mockUpdateEnfant,
        },
        $transaction: mockTransaction,
    },
}));

vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }));

import { getQuestionsAction, updateQuestionsAction, getQuestionsEnfantAction, updateQuestionsEnfantAction } from './questionnaire-questions.actions';

const FIXTURE = [
    { code: 'q1', label: "Un membre de votre famille est-il décédé subitement d'une cause cardiaque ?", ordre: 1 },
    { code: 'q2', label: "Avez-vous ressenti une douleur dans la poitrine ou des palpitations ?", ordre: 2 },
    { code: 'q3', label: "Avez-vous eu un épisode de respiration sifflante (asthme) ?", ordre: 3 },
    { code: 'q4', label: "Avez-vous eu une perte de connaissance au cours de l'année ?", ordre: 4 },
    { code: 'q5', label: "Avez-vous repris le sport sans accord médical après 30 jours d'arrêt ?", ordre: 5 },
    { code: 'q6', label: "Avez-vous débuté un traitement médical de longue durée récemment ?", ordre: 6 },
    { code: 'q7', label: "Ressentez-vous douleur ou raideur suite à un problème ostéo-articulaire ?", ordre: 7 },
    { code: 'q8', label: "Votre pratique sportive est-elle interrompue pour des raisons de santé ?", ordre: 8 },
    { code: 'q9', label: "Pensez-vous avoir besoin d'un avis médical pour poursuivre le sport ?", ordre: 9 },
];

describe('getQuestionsAction', () => {
    it('retourne les questions triées par ordre', async () => {
        mockFindMany.mockResolvedValue(FIXTURE);

        const result = await getQuestionsAction();

        expect(result).toEqual(FIXTURE);
        expect(mockFindMany).toHaveBeenCalledWith({ orderBy: { ordre: 'asc' } });
    });
});

describe('updateQuestionsAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await updateQuestionsAction(
            FIXTURE.map(({ code, label }) => ({ code, label }))
        );

        expect(result).toEqual({ success: false, error: 'Non autorisé' });
        expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('met à jour les questions et invalide le cache', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });
        mockTransaction.mockResolvedValue([]);

        const result = await updateQuestionsAction(
            FIXTURE.map(({ code, label }) => ({ code, label }))
        );

        expect(result).toEqual({ success: true });
        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/config/sante');
    });

    it('rejette un label trop court (< 10 caractères)', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });

        const result = await updateQuestionsAction([{ code: 'q1', label: 'Court' }]);

        expect(result).toEqual({ success: false, error: 'Données invalides' });
        expect(mockTransaction).not.toHaveBeenCalled();
    });
});

// ─── Fixture enfant ───────────────────────────────────────────────────────────

const FIXTURE_ENFANT = [
    { code: 'q1',  label: "Es-tu allé(e) à l'hôpital pendant toute une journée ou plusieurs jours ?", ordre: 1,  section: "Depuis l'année dernière" },
    { code: 'q2',  label: "As-tu été opéré(e) ?", ordre: 2,  section: "Depuis l'année dernière" },
    { code: 'q13', label: "Te sens-tu très fatigué(e) ?", ordre: 13, section: "Depuis un certain temps (plus de 2 semaines)" },
];

describe('getQuestionsEnfantAction', () => {
    it('retourne les questions enfant triées par ordre', async () => {
        mockFindManyEnfant.mockResolvedValue(FIXTURE_ENFANT);

        const result = await getQuestionsEnfantAction();

        expect(result).toEqual(FIXTURE_ENFANT);
        expect(mockFindManyEnfant).toHaveBeenCalledWith({ orderBy: { ordre: 'asc' } });
    });
});

describe('updateQuestionsEnfantAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await updateQuestionsEnfantAction(
            FIXTURE_ENFANT.map(({ code, label }) => ({ code, label }))
        );

        expect(result).toEqual({ success: false, error: 'Non autorisé' });
        expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('met à jour les questions enfant et invalide le cache', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });
        mockTransaction.mockResolvedValue([]);

        const result = await updateQuestionsEnfantAction(
            FIXTURE_ENFANT.map(({ code, label }) => ({ code, label }))
        );

        expect(result).toEqual({ success: true });
        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/config/sante');
    });

    it('rejette un label trop court (< 10 caractères)', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });

        const result = await updateQuestionsEnfantAction([{ code: 'q1', label: 'Court' }]);

        expect(result).toEqual({ success: false, error: 'Données invalides' });
        expect(mockTransaction).not.toHaveBeenCalled();
    });
});

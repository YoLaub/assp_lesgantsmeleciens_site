// @vitest-environment node
import { vi } from 'vitest';

const mockFindQuestionsByType = vi.hoisted(() => vi.fn());
const mockUpdateQuestionsLabels = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());
const mockAuth = vi.hoisted(() => vi.fn());

vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
    inscriptionRepository: {
        findQuestionsByType: mockFindQuestionsByType,
        updateQuestionsLabels: mockUpdateQuestionsLabels,
    },
}));

vi.mock('next/cache', () => ({ revalidatePath: mockRevalidatePath }));
vi.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }));

import { getQuestionsAction, updateQuestionsAction, getQuestionsEnfantAction, updateQuestionsEnfantAction } from './questionnaire-questions.actions';

const FIXTURE = [
    { id: 1, type: 'majeur', label: "Un membre de votre famille est-il décédé subitement d'une cause cardiaque ?", ordre: 1, section: null },
    { id: 2, type: 'majeur', label: "Avez-vous ressenti une douleur dans la poitrine ou des palpitations ?", ordre: 2, section: null },
    { id: 3, type: 'majeur', label: "Avez-vous eu un épisode de respiration sifflante (asthme) ?", ordre: 3, section: null },
];

describe('getQuestionsAction', () => {
    it('retourne les questions triées par ordre', async () => {
        mockFindQuestionsByType.mockResolvedValue(FIXTURE);

        const result = await getQuestionsAction();

        expect(result).toEqual(FIXTURE);
        expect(mockFindQuestionsByType).toHaveBeenCalledWith('majeur');
    });
});

describe('updateQuestionsAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await updateQuestionsAction(
            FIXTURE.map(({ id, label }) => ({ id, label }))
        );

        expect(result).toEqual({ success: false, error: 'Non autorisé' });
        expect(mockUpdateQuestionsLabels).not.toHaveBeenCalled();
    });

    it('met à jour les questions et invalide le cache', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });
        mockUpdateQuestionsLabels.mockResolvedValue(undefined);

        const result = await updateQuestionsAction(
            FIXTURE.map(({ id, label }) => ({ id, label }))
        );

        expect(result).toEqual({ success: true });
        expect(mockUpdateQuestionsLabels).toHaveBeenCalledTimes(1);
        expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/config/sante');
    });

    it('rejette un label trop court (< 10 caractères)', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });

        const result = await updateQuestionsAction([{ id: 1, label: 'Court' }]);

        expect(result).toEqual({ success: false, error: 'Données invalides' });
        expect(mockUpdateQuestionsLabels).not.toHaveBeenCalled();
    });
});

const FIXTURE_ENFANT = [
    { id: 10, type: 'mineur', label: "Es-tu allé(e) à l'hôpital pendant toute une journée ou plusieurs jours ?", ordre: 1, section: "Depuis l'année dernière" },
    { id: 11, type: 'mineur', label: "As-tu été opéré(e) ?", ordre: 2, section: "Depuis l'année dernière" },
    { id: 13, type: 'mineur', label: "Te sens-tu très fatigué(e) ?", ordre: 13, section: "Depuis un certain temps (plus de 2 semaines)" },
];

describe('getQuestionsEnfantAction', () => {
    it('retourne les questions enfant triées par ordre', async () => {
        mockFindQuestionsByType.mockResolvedValue(FIXTURE_ENFANT);

        const result = await getQuestionsEnfantAction();

        expect(result).toEqual(FIXTURE_ENFANT);
        expect(mockFindQuestionsByType).toHaveBeenCalledWith('mineur');
    });
});

describe('updateQuestionsEnfantAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
        mockAuth.mockResolvedValue({ userId: null });

        const result = await updateQuestionsEnfantAction(
            FIXTURE_ENFANT.map(({ id, label }) => ({ id, label }))
        );

        expect(result).toEqual({ success: false, error: 'Non autorisé' });
        expect(mockUpdateQuestionsLabels).not.toHaveBeenCalled();
    });

    it('met à jour les questions enfant et invalide le cache', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });
        mockUpdateQuestionsLabels.mockResolvedValue(undefined);

        const result = await updateQuestionsEnfantAction(
            FIXTURE_ENFANT.map(({ id, label }) => ({ id, label }))
        );

        expect(result).toEqual({ success: true });
        expect(mockUpdateQuestionsLabels).toHaveBeenCalledTimes(1);
        expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/config/sante');
    });

    it('rejette un label trop court (< 10 caractères)', async () => {
        mockAuth.mockResolvedValue({ userId: 'user_abc' });

        const result = await updateQuestionsEnfantAction([{ id: 10, label: 'Court' }]);

        expect(result).toEqual({ success: false, error: 'Données invalides' });
        expect(mockUpdateQuestionsLabels).not.toHaveBeenCalled();
    });
});

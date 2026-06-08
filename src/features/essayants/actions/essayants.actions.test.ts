// @vitest-environment node
import { vi } from 'vitest';

const mockFindFirst = vi.hoisted(() => vi.fn());
const mockCreate = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockFindUnique = vi.hoisted(() => vi.fn());
const mockFindMany = vi.hoisted(() => vi.fn());
const mockPresenceCreate = vi.hoisted(() => vi.fn());
const mockTransaction = vi.hoisted(() => vi.fn());
const mockVerifyHCaptcha = vi.hoisted(() => vi.fn());
const mockGenererNumero = vi.hoisted(() => vi.fn());
const mockCoachTokenFindFirst = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
    prisma: {
        membre: {
            findFirst: mockFindFirst,
            findUnique: mockFindUnique,
            create: mockCreate,
            update: mockUpdate,
            findMany: mockFindMany,
        },
        coachToken: { findFirst: mockCoachTokenFindFirst },
        presenceEssai: { create: mockPresenceCreate },
        $transaction: mockTransaction,
    },
}));

vi.mock('@/shared/lib/hcaptcha', () => ({ verifyHCaptcha: mockVerifyHCaptcha }));
vi.mock('@/shared/lib/adherent-utils', () => ({ genererNumeroMembreUnique: mockGenererNumero }));
vi.mock('@/shared/lib/mail', () => ({
    sendBienvenueEssayant: vi.fn(),
    sendNotificationNouvelEssayant: vi.fn(),
    sendRelanceEssayant: vi.fn(),
    sendConversionEssayant: vi.fn(),
    sendNotificationConversionAdmin: vi.fn(),
    sendLienAccesEssai: vi.fn(),
}));
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));

import {
    createEssayantAction,
    getMonEssaiAction,
    getEssayantsForCoachAction,
} from './essayants.actions';

describe('createEssayantAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it('retourne une erreur si hCaptcha échoue', async () => {
        mockVerifyHCaptcha.mockResolvedValue(false);

        const result = await createEssayantAction({
            nom: 'Dupont', prenom: 'Jean', email: 'j@test.fr',
            telephone: '0600000000', dateDeNaissance: '1990-01-01',
            hcaptchaToken: 'bad',
        });

        expect(result).toEqual({ success: false, error: 'Vérification hCaptcha échouée' });
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it('crée un Membre avec statut ESSAYANT', async () => {
        mockVerifyHCaptcha.mockResolvedValue(true);
        mockGenererNumero.mockResolvedValue('ADH-ABCDE');
        mockCreate.mockResolvedValue({
            id: 1, email: 'j@test.fr', prenom: 'Jean', nom: 'Dupont',
            telephone: '0600000000', numeroAdherent: 'ADH-ABCDE',
        });

        const result = await createEssayantAction({
            nom: 'Dupont', prenom: 'Jean', email: 'j@test.fr',
            telephone: '0600000000', dateDeNaissance: '1990-01-01',
            hcaptchaToken: 'valid',
        });

        expect(result).toEqual({ success: true, numeroAdherent: 'ADH-ABCDE' });
        expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ statut: 'ESSAYANT', email: 'j@test.fr' }),
            })
        );
    });

    it('retourne une erreur si email déjà utilisé', async () => {
        mockVerifyHCaptcha.mockResolvedValue(true);
        mockGenererNumero.mockResolvedValue('ADH-XXXXX');
        mockCreate.mockRejectedValue(new Error('Unique constraint failed on the fields: (`email`)'));

        const result = await createEssayantAction({
            nom: 'Dupont', prenom: 'Jean', email: 'existant@test.fr',
            telephone: '0600000000', dateDeNaissance: '1990-01-01',
            hcaptchaToken: 'valid',
        });

        expect(result).toEqual({ success: false, error: 'Un profil essayant existe déjà avec cet email.' });
    });
});

describe('getMonEssaiAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it('retourne une erreur si token vide', async () => {
        const result = await getMonEssaiAction('');
        expect(result).toEqual({ success: false, error: 'Token manquant' });
        expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('retourne une erreur si token invalide ou expiré', async () => {
        mockFindFirst.mockResolvedValue(null);

        const result = await getMonEssaiAction('invalid-token');

        expect(result).toEqual({ success: false, error: 'Lien invalide ou expiré' });
        expect(mockFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    statut: 'ESSAYANT',
                    accesToken: 'invalid-token',
                }),
            })
        );
    });

    it('retourne les données essayant si token valide', async () => {
        const fakeMembre = {
            id: 1, numeroAdherent: 'ADH-ABCDE', nom: 'Dupont', prenom: 'Jean',
            nombrePresences: 2, accesBloque: false, accesToken: 'valid-token',
            presences: [],
        };
        mockFindFirst.mockResolvedValue(fakeMembre);

        const result = await getMonEssaiAction('valid-token');

        expect(result.success).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = result as any;
        expect(r.essayant.nombrePresences).toBe(2);
        expect(r.essayant.id).toBe(1);
        expect(r.accesToken).toBe('valid-token');
    });
});

describe('getEssayantsForCoachAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it('retourne une erreur si coach token invalide', async () => {
        mockCoachTokenFindFirst.mockResolvedValue(null);

        const result = await getEssayantsForCoachAction('bad-token');

        expect(result).toEqual({ success: false, error: 'Token invalide ou expiré' });
        expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('filtre uniquement les membres avec statut ESSAYANT', async () => {
        mockCoachTokenFindFirst.mockResolvedValue({ id: 1, token: 'valid', expireLe: new Date(Date.now() + 9999999) });
        mockFindMany.mockResolvedValue([
            { id: 1, numeroAdherent: 'ADH-AAA', nom: 'Martin', prenom: 'Alice', nombrePresences: 1, accesBloque: false, presences: [] },
        ]);

        const result = await getEssayantsForCoachAction('valid');

        expect(result.success).toBe(true);
        expect(mockFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { statut: 'ESSAYANT' },
            })
        );
    });
});

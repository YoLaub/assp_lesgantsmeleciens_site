// @vitest-environment node
import { vi } from 'vitest';

const mockCreateEssayant = vi.hoisted(() => vi.fn());
const mockRequestAccesEssai = vi.hoisted(() => vi.fn());
const mockGetMonEssai = vi.hoisted(() => vi.fn());
const mockPointerPresence = vi.hoisted(() => vi.fn());
const mockGetEssayantsForCoach = vi.hoisted(() => vi.fn());

vi.mock('../domain/use-cases/create-essayant.use-case', () => ({ createEssayantUseCase: mockCreateEssayant }));
vi.mock('../domain/use-cases/request-acces-essai.use-case', () => ({ requestAccesEssaiUseCase: mockRequestAccesEssai }));
vi.mock('../domain/use-cases/get-mon-essai.use-case', () => ({ getMonEssaiUseCase: mockGetMonEssai }));
vi.mock('../domain/use-cases/pointer-presence.use-case', () => ({ pointerPresenceUseCase: mockPointerPresence }));
vi.mock('../domain/use-cases/get-essayants-for-coach.use-case', () => ({ getEssayantsForCoachUseCase: mockGetEssayantsForCoach }));

const mockVerifyHCaptcha = vi.hoisted(() => vi.fn());
const mockCheckRateLimit = vi.hoisted(() => vi.fn());
vi.mock('@/shared/lib/hcaptcha', () => ({ verifyHCaptcha: mockVerifyHCaptcha }));
vi.mock('@/shared/lib/rate-limit', () => ({ checkRateLimit: mockCheckRateLimit }));
vi.mock('@/shared/lib/mail', () => ({
    sendBienvenueEssayant: vi.fn(), sendNotificationNouvelEssayant: vi.fn(),
    sendRelanceEssayant: vi.fn(), sendConversionEssayant: vi.fn(),
    sendNotificationConversionAdmin: vi.fn(), sendLienAccesEssai: vi.fn(),
}));
vi.mock('@/shared/lib/prisma', () => ({
    prisma: { coachToken: { findFirst: vi.fn() }, membre: { findFirst: vi.fn() } },
}));
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));

import { createEssayantAction, getMonEssaiAction, getEssayantsForCoachAction } from './essayants.actions';

describe('createEssayantAction', () => {
    beforeEach(() => { vi.clearAllMocks(); mockCheckRateLimit.mockResolvedValue(true); });

    it('retourne une erreur si hCaptcha échoue', async () => {
        mockVerifyHCaptcha.mockResolvedValue(false);
        const result = await createEssayantAction({ nom: 'Dupont', prenom: 'Jean', email: 'j@test.fr', telephone: '0600000000', dateDeNaissance: '1990-01-01', hcaptchaToken: 'bad' });
        expect(result).toEqual({ success: false, error: 'Vérification hCaptcha échouée' });
        expect(mockCreateEssayant).not.toHaveBeenCalled();
    });

    it('crée un essayant via le use-case', async () => {
        mockVerifyHCaptcha.mockResolvedValue(true);
        mockCreateEssayant.mockResolvedValue({
            membre: { id: 'uuid-1', email: 'j@test.fr', prenom: 'Jean', nom: 'Dupont', telephone: '0600000000' },
            numeroAdherent: 'ADH-ABCDE', accesToken: 'token-123',
        });
        const result = await createEssayantAction({ nom: 'Dupont', prenom: 'Jean', email: 'j@test.fr', telephone: '0600000000', dateDeNaissance: '1990-01-01', hcaptchaToken: 'valid' });
        expect(result).toEqual({ success: true, numeroAdherent: 'ADH-ABCDE' });
        expect(mockCreateEssayant).toHaveBeenCalledWith(expect.objectContaining({ email: 'j@test.fr' }));
    });

    it('retourne une erreur si email déjà utilisé', async () => {
        mockVerifyHCaptcha.mockResolvedValue(true);
        mockCreateEssayant.mockRejectedValue(new Error('Unique constraint failed on the fields: (`email`)'));
        const result = await createEssayantAction({ nom: 'Dupont', prenom: 'Jean', email: 'e@test.fr', telephone: '0600000000', dateDeNaissance: '1990-01-01', hcaptchaToken: 'valid' });
        expect(result).toEqual({ success: false, error: 'Un profil essayant existe déjà avec cet email.' });
    });
});

describe('getMonEssaiAction', () => {
    beforeEach(() => vi.clearAllMocks());

    it('retourne une erreur si token vide', async () => {
        const result = await getMonEssaiAction('');
        expect(result).toEqual({ success: false, error: 'Token manquant' });
        expect(mockGetMonEssai).not.toHaveBeenCalled();
    });

    it('retourne une erreur si token invalide', async () => {
        mockGetMonEssai.mockResolvedValue(null);
        const result = await getMonEssaiAction('bad-token');
        expect(result).toEqual({ success: false, error: 'Lien invalide ou expiré' });
    });

    it('retourne les données essayant si token valide', async () => {
        const fakeData = { id: 'uuid-1', inscriptionId: 42, numeroAdherent: 'ADH-ABCDE', nom: 'Dupont', prenom: 'Jean', nombrePresences: 2, accesBloque: false, accesToken: 'valid-token' };
        mockGetMonEssai.mockResolvedValue(fakeData);
        const result = await getMonEssaiAction('valid-token');
        expect(result.success).toBe(true);
        const r = result as { success: true; essayant: typeof fakeData };
        expect(r.essayant.nombrePresences).toBe(2);
    });
});

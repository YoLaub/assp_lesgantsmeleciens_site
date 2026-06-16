// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({ verify: vi.fn(), rate: vi.fn(), create: vi.fn(), sendConf: vi.fn(), sendNotif: vi.fn() }));
vi.mock('@/shared/lib/hcaptcha', () => ({ verifyHCaptcha: h.verify }));
vi.mock('@/shared/lib/rate-limit', () => ({ checkRateLimit: h.rate }));
vi.mock('@/shared/lib/mail', () => ({ sendConfirmationInscription: h.sendConf, sendNotificationNouveauDossier: h.sendNotif }));
vi.mock('../domain/use-cases/create-adherent.use-case', () => ({ createAdherentUseCase: h.create }));

import { createAdherentAction } from './create-adherent.actions';

const input = { nom: 'Test', prenom: 'Alice', dateDeNaissance: '2000-01-01', sexe: 'F' as const, email: 'a@t.fr', oxygene: false, couponSport: false, bonCaf: false, hcaptchaToken: 'tok' };

beforeEach(() => { vi.clearAllMocks(); h.rate.mockResolvedValue(true); h.verify.mockResolvedValue(true); });

describe('createAdherentAction', () => {
  it('bloque sur rate-limit', async () => {
    h.rate.mockResolvedValue(false);
    expect(await createAdherentAction(input)).toMatchObject({ success: false });
  });
  it('échoue si hCaptcha invalide', async () => {
    h.verify.mockResolvedValue(false);
    expect(await createAdherentAction(input)).toMatchObject({ success: false, error: 'Vérification hCaptcha échouée' });
  });
  it('rejette des données invalides', async () => {
    expect(await createAdherentAction({ ...input, email: 'pas-email' })).toMatchObject({ success: false });
  });
  it('crée le dossier et envoie les emails', async () => {
    h.create.mockResolvedValue({ membre: { id: 'm-1', email: 'a@t.fr', prenom: 'Alice', nom: 'Test' }, numeroAdherent: 'ADH-1', montant: 140, categorie: 'adulte' });
    expect(await createAdherentAction(input)).toEqual({ success: true, numeroAdherent: 'ADH-1' });
    expect(h.sendConf).toHaveBeenCalled();
    expect(h.sendNotif).toHaveBeenCalled();
  });
  it('détecte un email déjà utilisé', async () => {
    h.create.mockRejectedValue(new Error('Unique constraint failed on the fields: (`email`)'));
    expect(await createAdherentAction(input)).toMatchObject({ success: false, error: 'Un dossier existe déjà avec cet email.' });
  });
});

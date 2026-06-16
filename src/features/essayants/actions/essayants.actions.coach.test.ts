// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  verify: vi.fn(), rate: vi.fn(), auth: vi.fn(),
  coachFindFirst: vi.fn(), coachCreate: vi.fn(), membreFindFirst: vi.fn(),
  requestAcces: vi.fn(), pointer: vi.fn(), conversion: vi.fn(), forCoach: vi.fn(),
  sendRelance: vi.fn(), sendConversion: vi.fn(), sendNotifAdmin: vi.fn(), sendLien: vi.fn(),
}));

vi.mock('@/shared/lib/hcaptcha', () => ({ verifyHCaptcha: h.verify }));
vi.mock('@/shared/lib/rate-limit', () => ({ checkRateLimit: h.rate }));
vi.mock('@clerk/nextjs/server', () => ({ auth: h.auth }));
vi.mock('@/shared/lib/prisma', () => ({
  prisma: { coachToken: { findFirst: h.coachFindFirst, create: h.coachCreate }, membre: { findFirst: h.membreFindFirst } },
}));
vi.mock('@/shared/lib/mail', () => ({
  sendBienvenueEssayant: vi.fn(), sendNotificationNouvelEssayant: vi.fn(),
  sendRelanceEssayant: h.sendRelance, sendConversionEssayant: h.sendConversion,
  sendNotificationConversionAdmin: h.sendNotifAdmin, sendLienAccesEssai: h.sendLien,
}));
vi.mock('../domain/use-cases/create-essayant.use-case', () => ({ createEssayantUseCase: vi.fn() }));
vi.mock('../domain/use-cases/request-acces-essai.use-case', () => ({ requestAccesEssaiUseCase: h.requestAcces }));
vi.mock('../domain/use-cases/get-mon-essai.use-case', () => ({ getMonEssaiUseCase: vi.fn() }));
vi.mock('../domain/use-cases/pointer-presence.use-case', () => ({ pointerPresenceUseCase: h.pointer }));
vi.mock('../domain/use-cases/get-essayant-conversion-data.use-case', () => ({ getEssayantConversionDataUseCase: h.conversion }));
vi.mock('../domain/use-cases/get-essayants-for-coach.use-case', () => ({ getEssayantsForCoachUseCase: h.forCoach }));

import * as actions from './essayants.actions';

const membre = { email: 'e@t.fr', prenom: 'Eva', numeroAdherent: 'ADH-1' };
beforeEach(() => { vi.clearAllMocks(); h.auth.mockResolvedValue({ userId: 'admin' }); });

describe('requestAccesEssaiAction', () => {
  beforeEach(() => { h.rate.mockResolvedValue(true); h.verify.mockResolvedValue(true); });
  it('bloque sur rate-limit', async () => {
    h.rate.mockResolvedValue(false);
    expect(await actions.requestAccesEssaiAction({ email: 'e@t.fr', numeroAdherent: 'ADH-1', hcaptchaToken: 't' })).toMatchObject({ success: false });
  });
  it('envoie le lien si membre trouvé', async () => {
    h.requestAcces.mockResolvedValue({ email: 'e@t.fr', prenom: 'Eva', token: 'tok' });
    expect(await actions.requestAccesEssaiAction({ email: 'e@t.fr', numeroAdherent: 'ADH-1', hcaptchaToken: 't' })).toEqual({ success: true });
    expect(h.sendLien).toHaveBeenCalled();
  });
  it('réussit silencieusement si non trouvé', async () => {
    h.requestAcces.mockResolvedValue(null);
    expect(await actions.requestAccesEssaiAction({ email: 'x@t.fr', numeroAdherent: 'ADH-9', hcaptchaToken: 't' })).toEqual({ success: true });
  });
});

describe('pointerPresenceAction', () => {
  it('refuse un token coach invalide', async () => {
    h.coachFindFirst.mockResolvedValue(null);
    expect(await actions.pointerPresenceAction(1, 'bad', 'Coach')).toMatchObject({ success: false });
  });
  it('relaie l\'échec du use-case', async () => {
    h.coachFindFirst.mockResolvedValue({ id: 1 });
    h.pointer.mockResolvedValue({ success: false, error: 'bloqué' });
    expect(await actions.pointerPresenceAction(1, 'tok', 'Coach')).toMatchObject({ success: false });
  });
  it('envoie une relance au 1er cours', async () => {
    h.coachFindFirst.mockResolvedValue({ id: 1 });
    h.pointer.mockResolvedValue({ success: true, nouvPresences: 1, bloque: false, membre, newToken: undefined });
    const res = await actions.pointerPresenceAction(1, 'tok', 'Coach');
    expect(res).toEqual({ success: true, nombrePresences: 1 });
    expect(h.sendRelance).toHaveBeenCalled();
  });
  it('envoie conversion + notif admin au blocage', async () => {
    h.coachFindFirst.mockResolvedValue({ id: 1 });
    h.pointer.mockResolvedValue({ success: true, nouvPresences: 3, bloque: true, membre, newToken: 'newtok' });
    h.membreFindFirst.mockResolvedValue({ nom: 'Test' });
    const res = await actions.pointerPresenceAction(1, 'tok', 'Coach');
    expect(res).toMatchObject({ success: true });
    expect(h.sendConversion).toHaveBeenCalled();
    expect(h.sendNotifAdmin).toHaveBeenCalled();
  });
});

describe('getEssayantConversionDataAction', () => {
  it('refuse un token vide', async () => {
    expect(await actions.getEssayantConversionDataAction('')).toMatchObject({ success: false });
  });
  it('retourne les données', async () => {
    h.conversion.mockResolvedValue({ membreId: 'm-1' });
    expect(await actions.getEssayantConversionDataAction('tok')).toEqual({ success: true, data: { membreId: 'm-1' } });
  });
});

describe('coach tokens', () => {
  it('genererCoachTokenAction refuse les non-admins', async () => {
    h.auth.mockResolvedValue({ userId: null });
    expect(await actions.genererCoachTokenAction()).toMatchObject({ success: false });
  });
  it('genererCoachTokenAction crée un token', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app';
    const res = await actions.genererCoachTokenAction();
    expect(res).toMatchObject({ success: true });
    expect(h.coachCreate).toHaveBeenCalled();
  });
  it('getCoachTokenActifAction retourne null si aucun token', async () => {
    h.coachFindFirst.mockResolvedValue(null);
    expect(await actions.getCoachTokenActifAction()).toEqual({ success: true, token: null });
  });
  it('getCoachTokenActifAction retourne le token actif', async () => {
    h.coachFindFirst.mockResolvedValue({ id: 1, token: 'tk', expireLe: new Date(Date.now() + 1e6) });
    const res = await actions.getCoachTokenActifAction();
    expect(res).toMatchObject({ success: true });
  });
  it('getEssayantsForCoachAction refuse un token invalide', async () => {
    h.coachFindFirst.mockResolvedValue(null);
    expect(await actions.getEssayantsForCoachAction('bad')).toMatchObject({ success: false });
  });
  it('getEssayantsForCoachAction liste les essayants', async () => {
    h.coachFindFirst.mockResolvedValue({ id: 1 });
    h.forCoach.mockResolvedValue([{ id: 1 }]);
    expect(await actions.getEssayantsForCoachAction('tok')).toMatchObject({ success: true });
  });
});

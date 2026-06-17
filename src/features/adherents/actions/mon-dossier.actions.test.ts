// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  verifyHCaptcha: vi.fn(), checkRateLimit: vi.fn(), sendLien: vi.fn(),
  membreFindFirst: vi.fn(), membreUpdate: vi.fn(),
  findByToken: vi.fn(),
  getMonDossier: vi.fn(), soumettreQ: vi.fn(), signer: vi.fn(), setPaiement: vi.fn(),
  patchSortie: vi.fn(), updateTel: vi.fn(), updateAdr: vi.fn(), updateDroit: vi.fn(),
  validerEng: vi.fn(), uploadDoc: vi.fn(), createCheckout: vi.fn(),
}));

vi.mock('@/shared/lib/hcaptcha', () => ({ verifyHCaptcha: h.verifyHCaptcha }));
vi.mock('@/shared/lib/rate-limit', () => ({ checkRateLimit: h.checkRateLimit }));
vi.mock('@/shared/lib/mail', () => ({ sendLienAccesDossier: h.sendLien }));
vi.mock('@/shared/lib/token', () => ({ hashToken: (t: string) => `hashed:${t}` }));
vi.mock('@/shared/lib/prisma', () => ({ prisma: { membre: { findFirst: h.membreFindFirst, update: h.membreUpdate } } }));
vi.mock('@/features/adhesion/data/repositories/inscription.repository.impl', () => ({
  inscriptionRepository: { findByToken: h.findByToken },
}));
vi.mock('../domain/use-cases/get-mon-dossier.use-case', () => ({ getMonDossierUseCase: h.getMonDossier }));
vi.mock('../domain/use-cases/soumettre-questionnaire.use-case', () => ({ soumettreQuestionnaireUseCase: h.soumettreQ }));
vi.mock('../domain/use-cases/signer-reglement.use-case', () => ({ signerReglementUseCase: h.signer }));
vi.mock('../domain/use-cases/set-type-paiement.use-case', () => ({ setTypePaiementUseCase: h.setPaiement }));
vi.mock('../domain/use-cases/patch-autorisation-sortie.use-case', () => ({ patchAutorisationSortieUseCase: h.patchSortie }));
vi.mock('../domain/use-cases/update-telephone.use-case', () => ({ updateTelephoneUseCase: h.updateTel }));
vi.mock('../domain/use-cases/update-adresse.use-case', () => ({ updateAdresseUseCase: h.updateAdr }));
vi.mock('../domain/use-cases/update-droit-image.use-case', () => ({ updateDroitImageUseCase: h.updateDroit }));
vi.mock('../domain/use-cases/valider-engagement.use-case', () => ({ validerEngagementUseCase: h.validerEng }));
vi.mock('../domain/use-cases/upload-document-adherent.use-case', () => ({ uploadDocumentAdherentUseCase: h.uploadDoc }));
vi.mock('../domain/use-cases/create-checkout.use-case', () => ({ createCheckoutUseCase: h.createCheckout }));

import * as actions from './mon-dossier.actions';

const insc = { id: 1, membreId: 'm-1' };

beforeEach(() => {
  vi.clearAllMocks();
  h.findByToken.mockResolvedValue(insc);
});

describe('requestAccesDossierAction', () => {
  it('bloque si rate-limit dépassé', async () => {
    h.checkRateLimit.mockResolvedValue(false);
    expect(await actions.requestAccesDossierAction({ email: 'a@t.fr', numeroAdherent: 'ADH-1', hcaptchaToken: 't' })).toMatchObject({ success: false });
  });

  it('échoue si hCaptcha invalide', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    h.verifyHCaptcha.mockResolvedValue(false);
    expect(await actions.requestAccesDossierAction({ email: 'a@t.fr', numeroAdherent: 'ADH-1', hcaptchaToken: 't' })).toMatchObject({ success: false });
  });

  it('envoie le lien si le membre existe', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    h.verifyHCaptcha.mockResolvedValue(true);
    h.membreFindFirst.mockResolvedValue({ id: 'm-1', email: 'a@t.fr', prenom: 'A' });
    expect(await actions.requestAccesDossierAction({ email: 'a@t.fr', numeroAdherent: 'ADH-1', hcaptchaToken: 't' })).toEqual({ success: true });
    expect(h.sendLien).toHaveBeenCalled();
  });

  it('réussit silencieusement même si le membre n\'existe pas', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    h.verifyHCaptcha.mockResolvedValue(true);
    h.membreFindFirst.mockResolvedValue(null);
    expect(await actions.requestAccesDossierAction({ email: 'x@t.fr', numeroAdherent: 'ADH-9', hcaptchaToken: 't' })).toEqual({ success: true });
    expect(h.sendLien).not.toHaveBeenCalled();
  });
});

describe('getMonDossierAction', () => {
  it('refuse un token vide', async () => {
    expect(await actions.getMonDossierAction('')).toMatchObject({ success: false });
  });
  it('retourne le dossier', async () => {
    h.getMonDossier.mockResolvedValue({ id: 'm-1' });
    expect(await actions.getMonDossierAction('tok')).toEqual({ success: true, adherent: { id: 'm-1' } });
  });
  it('échoue si introuvable', async () => {
    h.getMonDossier.mockResolvedValue(null);
    expect(await actions.getMonDossierAction('tok')).toMatchObject({ success: false });
  });
});

describe('actions liées à une inscription (token)', () => {
  it('soumettreQuestionnaireAction valide et délègue', async () => {
    h.soumettreQ.mockResolvedValue({ certificatMedicalReq: true });
    const reps = { q1: true, q2: false, q3: false, q4: false, q5: false, q6: false, q7: false };
    expect(await actions.soumettreQuestionnaireAction('tok', reps, true)).toEqual({ success: true, certificatMedicalReq: true });
  });

  it('soumettreQuestionnaireAction rejette des données invalides', async () => {
    expect(await actions.soumettreQuestionnaireAction('tok', { q1: true } as never, true)).toMatchObject({ success: false });
  });

  it('signerReglementAction délègue', async () => {
    expect(await actions.signerReglementAction('tok')).toEqual({ success: true });
    expect(h.signer).toHaveBeenCalledWith(1);
  });

  it('signerReglementAction échoue si token invalide', async () => {
    h.findByToken.mockResolvedValue(null);
    expect(await actions.signerReglementAction('tok')).toMatchObject({ success: false });
  });

  it('setTypePaiementAction refuse une valeur invalide', async () => {
    expect(await actions.setTypePaiementAction('tok', 'cash' as never)).toMatchObject({ success: false });
  });

  it('setTypePaiementAction délègue', async () => {
    expect(await actions.setTypePaiementAction('tok', 'en_ligne')).toEqual({ success: true });
    expect(h.setPaiement).toHaveBeenCalledWith(1, 'en_ligne');
  });

  it('patchAutorisationSortieAction délègue', async () => {
    expect(await actions.patchAutorisationSortieAction('tok', false)).toEqual({ success: true });
    expect(h.patchSortie).toHaveBeenCalledWith(1, false);
  });

  it('updateTelephoneAction valide le numéro', async () => {
    expect(await actions.updateTelephoneAction('tok', { telephone1: '0612345678' })).toEqual({ success: true });
    expect(await actions.updateTelephoneAction('tok', { telephone1: '123' })).toMatchObject({ success: false });
  });

  it('updateAdresseAction valide code postal/INSEE', async () => {
    const ok = { adresse: '1 rue X', codePostal: '59000', codeInsee: '59350', communeNom: 'Lille' };
    expect(await actions.updateAdresseAction('tok', ok)).toEqual({ success: true });
    expect(await actions.updateAdresseAction('tok', { ...ok, codePostal: 'XX' })).toMatchObject({ success: false });
  });

  it('updateDroitImageAction et validerEngagementAction délèguent', async () => {
    expect(await actions.updateDroitImageAction('tok', true)).toEqual({ success: true });
    expect(await actions.validerEngagementAction('tok')).toEqual({ success: true });
  });

  it('createCheckoutAction retourne l\'url', async () => {
    h.createCheckout.mockResolvedValue('https://stripe');
    process.env.NEXT_PUBLIC_APP_URL = 'https://app';
    expect(await actions.createCheckoutAction('tok')).toEqual({ success: true, url: 'https://stripe' });
  });

  it('createCheckoutAction capture une erreur', async () => {
    h.createCheckout.mockRejectedValue(new Error('Documents en attente'));
    expect(await actions.createCheckoutAction('tok')).toMatchObject({ success: false, error: 'Documents en attente' });
  });
});

describe('garde "lien invalide" (inscription introuvable)', () => {
  beforeEach(() => h.findByToken.mockResolvedValue(null));

  it.each([
    ['setTypePaiementAction', () => actions.setTypePaiementAction('tok', 'en_ligne')],
    ['patchAutorisationSortieAction', () => actions.patchAutorisationSortieAction('tok', true)],
    ['updateTelephoneAction', () => actions.updateTelephoneAction('tok', { telephone1: '0612345678' })],
    ['updateAdresseAction', () => actions.updateAdresseAction('tok', { adresse: '1 rue X', codePostal: '59000', codeInsee: '59350', communeNom: 'Lille' })],
    ['updateDroitImageAction', () => actions.updateDroitImageAction('tok', true)],
    ['validerEngagementAction', () => actions.validerEngagementAction('tok')],
    ['soumettreQuestionnaireEnfantAction', () => actions.soumettreQuestionnaireEnfantAction('tok', Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`q${i + 1}`, false])) as never, true)],
  ])('%s échoue si le lien est invalide', async (_n, fn) => {
    expect(await fn()).toMatchObject({ success: false });
  });
});

describe('uploadDocumentAdherentAction', () => {
  const fd = (file: unknown) => ({ get: () => file } as unknown as FormData);

  it('refuse un format non autorisé', async () => {
    const res = await actions.uploadDocumentAdherentAction('tok', fd({ type: 'text/plain', size: 1 }), 'ID_PHOTO');
    expect(res).toMatchObject({ success: false });
  });

  it('refuse un fichier trop lourd', async () => {
    const res = await actions.uploadDocumentAdherentAction('tok', fd({ type: 'image/png', size: 6 * 1024 * 1024 }), 'ID_PHOTO');
    expect(res).toMatchObject({ success: false });
  });

  it('téléverse un fichier valide', async () => {
    h.uploadDoc.mockResolvedValue('https://cdn/doc');
    const res = await actions.uploadDocumentAdherentAction('tok', fd({ type: 'image/png', size: 100 }), 'ID_PHOTO');
    expect(res).toEqual({ success: true, url: 'https://cdn/doc' });
  });
});

describe('gate consentement questionnaire', () => {
  beforeEach(() => {
    h.findByToken.mockResolvedValue({ id: 1, membreId: 'm-1' });
    h.soumettreQ.mockResolvedValue({ certificatMedicalReq: false });
  });

  it('refuse le questionnaire majeur sans consentement', async () => {
    const r = { q1: true, q2: true, q3: true, q4: true, q5: true, q6: true, q7: true };
    const res = await actions.soumettreQuestionnaireAction('tok', r, false);
    expect(res).toMatchObject({ success: false });
    expect(h.soumettreQ).not.toHaveBeenCalled();
  });

  it('accepte le questionnaire majeur avec consentement', async () => {
    const r = { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q7: false };
    const res = await actions.soumettreQuestionnaireAction('tok', r, true);
    expect(res).toMatchObject({ success: true });
    expect(h.soumettreQ).toHaveBeenCalled();
  });

  it('refuse le questionnaire enfant sans consentement', async () => {
    const res = await actions.soumettreQuestionnaireEnfantAction('tok', {} as never, false);
    expect(res).toMatchObject({ success: false });
    expect(h.soumettreQ).not.toHaveBeenCalled();
  });
});

describe('demanderLienRenouvellementAction', () => {
  it('bloque si rate-limit dépassé', async () => {
    h.checkRateLimit.mockResolvedValue(false);
    expect(await actions.demanderLienRenouvellementAction({ email: 'a@t.fr', hcaptchaToken: 't' })).toMatchObject({ success: false });
    expect(h.sendLien).not.toHaveBeenCalled();
  });

  it('refuse un email invalide', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    expect(await actions.demanderLienRenouvellementAction({ email: 'pas-un-email', hcaptchaToken: 't' })).toMatchObject({ success: false });
    expect(h.verifyHCaptcha).not.toHaveBeenCalled();
  });

  it('échoue si hCaptcha invalide', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    h.verifyHCaptcha.mockResolvedValue(false);
    expect(await actions.demanderLienRenouvellementAction({ email: 'a@t.fr', hcaptchaToken: 't' })).toMatchObject({ success: false });
    expect(h.sendLien).not.toHaveBeenCalled();
  });

  it('envoie le lien sans renvoyer de données si le membre existe', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    h.verifyHCaptcha.mockResolvedValue(true);
    h.membreFindFirst.mockResolvedValue({ id: 'm-1', email: 'a@t.fr', prenom: 'A' });
    const res = await actions.demanderLienRenouvellementAction({ email: 'a@t.fr', hcaptchaToken: 't' });
    expect(res).toEqual({ success: true });
    expect(res).not.toHaveProperty('data');
    expect(h.sendLien).toHaveBeenCalled();
  });

  it('réussit silencieusement (anti-énumération) si aucun dossier', async () => {
    h.checkRateLimit.mockResolvedValue(true);
    h.verifyHCaptcha.mockResolvedValue(true);
    h.membreFindFirst.mockResolvedValue(null);
    expect(await actions.demanderLienRenouvellementAction({ email: 'x@t.fr', hcaptchaToken: 't' })).toEqual({ success: true });
    expect(h.sendLien).not.toHaveBeenCalled();
  });
});

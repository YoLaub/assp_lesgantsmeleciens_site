// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as mail from './mail';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  fetchMock.mockReset().mockResolvedValue({ ok: true, status: 200, text: async () => '' });
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  process.env.BREVO_API_KEY = 'xkeysib-test';
  process.env.CLUB_EMAIL = 'club@test.fr';
  process.env.ADMIN_EMAIL = 'admin@test.fr';
  process.env.NEXT_PUBLIC_APP_URL = 'https://app.test';
});

afterEach(() => vi.unstubAllGlobals());

function lastBody() {
  return JSON.parse(fetchMock.mock.calls.at(-1)![1].body as string);
}

describe('sendEmail (via sendConfirmationInscription)', () => {
  it('POST vers l\'API Brevo avec destinataire et sujet', async () => {
    await mail.sendConfirmationInscription({ email: 'a@test.fr', prenom: 'Alice', numeroAdherent: 'ADH-1', certificatRequis: false });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(opts.headers['api-key']).toBe('xkeysib-test');
    const body = JSON.parse(opts.body);
    expect(body.to[0].email).toBe('a@test.fr');
    expect(body.subject).toMatch(/inscription/i);
  });

  it('ajoute le bloc certificat quand requis', async () => {
    await mail.sendConfirmationInscription({ email: 'a@test.fr', prenom: 'Alice', numeroAdherent: 'ADH-1', certificatRequis: true });
    expect(lastBody().htmlContent).toMatch(/certificat médical/i);
  });

  it('n\'envoie rien si la clé Brevo est absente', async () => {
    delete process.env.BREVO_API_KEY;
    await mail.sendConfirmationInscription({ email: 'a@test.fr', prenom: 'Alice', numeroAdherent: 'ADH-1', certificatRequis: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logue une erreur si Brevo répond non-ok', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, text: async () => 'bad sender' });
    await mail.sendConfirmationInscription({ email: 'a@test.fr', prenom: 'Alice', numeroAdherent: 'ADH-1', certificatRequis: false });
    expect(console.error).toHaveBeenCalled();
  });
});

describe('emails admin (retour anticipé sans ADMIN_EMAIL)', () => {
  it('n\'envoie pas la notification nouveau dossier sans ADMIN_EMAIL', async () => {
    delete process.env.ADMIN_EMAIL;
    await mail.sendNotificationNouveauDossier({ nom: 'N', prenom: 'P', numeroAdherent: 'ADH-1', categorie: 'adulte', montant: 140, certificatRequis: false, adherentId: 'id-1' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envoie la notification nouveau dossier vers ADMIN_EMAIL', async () => {
    await mail.sendNotificationNouveauDossier({ nom: 'N', prenom: 'P', numeroAdherent: 'ADH-1', categorie: 'adulte', montant: 140, typePaiement: 'en_ligne', certificatRequis: true, adherentId: 'id-1' });
    expect(lastBody().to[0].email).toBe('admin@test.fr');
  });

  it('utilise "À définir" quand le type de paiement est absent', async () => {
    await mail.sendNotificationNouveauDossier({ nom: 'N', prenom: 'P', numeroAdherent: 'ADH-1', categorie: 'adulte', montant: 140, certificatRequis: false, adherentId: 'id-1' });
    expect(lastBody().htmlContent).toMatch(/À définir/);
  });
});

describe('toutes les fonctions d\'envoi appellent Brevo', () => {
  const cas: [string, () => Promise<void>][] = [
    ['sendLienAccesDossier', () => mail.sendLienAccesDossier({ email: 'a@t.fr', prenom: 'A', token: 'tok' })],
    ['sendConfirmationPaiement', () => mail.sendConfirmationPaiement({ email: 'a@t.fr', prenom: 'A', numeroAdherent: 'ADH-1', montant: 140, saison: '2025-2026' })],
    ['sendNotificationPaiementRecu', () => mail.sendNotificationPaiementRecu({ nom: 'N', prenom: 'P', numeroAdherent: 'ADH-1', montant: 140 })],
    ['sendDocumentValide', () => mail.sendDocumentValide({ email: 'a@t.fr', prenom: 'A', labelDocument: 'certificat' })],
    ['sendDocumentRejete', () => mail.sendDocumentRejete({ email: 'a@t.fr', prenom: 'A', labelDocument: 'certificat' })],
    ['sendRappelDossierIncomplet', () => mail.sendRappelDossierIncomplet({ email: 'a@t.fr', prenom: 'A', numeroAdherent: 'ADH-1' })],
    ['sendOuvertureInscriptions', () => mail.sendOuvertureInscriptions({ email: 'a@t.fr', prenom: 'A' })],
    ['sendBonCafValide', () => mail.sendBonCafValide({ email: 'a@t.fr', prenom: 'A' })],
    ['sendNotificationRejetDossier', () => mail.sendNotificationRejetDossier({ email: 'a@t.fr', prenom: 'A' })],
    ['sendBienvenueEssayant', () => mail.sendBienvenueEssayant({ email: 'a@t.fr', prenom: 'A', numeroAdherent: 'ADH-1', accesToken: 'tok' })],
    ['sendNotificationNouvelEssayant', () => mail.sendNotificationNouvelEssayant({ nom: 'N', prenom: 'P', numeroAdherent: 'ADH-1', email: 'a@t.fr', telephone: '06' })],
    ['sendRelanceEssayant', () => mail.sendRelanceEssayant({ email: 'a@t.fr', prenom: 'A', numeroAdherent: 'ADH-1', nombrePresences: 1 })],
    ['sendConversionEssayant', () => mail.sendConversionEssayant({ email: 'a@t.fr', prenom: 'A', numeroAdherent: 'ADH-1', accesToken: 'tok' })],
    ['sendNotificationConversionAdmin', () => mail.sendNotificationConversionAdmin({ nom: 'N', prenom: 'P', numeroAdherent: 'ADH-1' })],
    ['sendLienAccesEssai', () => mail.sendLienAccesEssai({ email: 'a@t.fr', prenom: 'A', token: 'tok' })],
    ['sendConfirmationEmail', () => mail.sendConfirmationEmail('a@t.fr', 'A')],
  ];

  it.each(cas)('%s envoie un email', async (_nom, fn) => {
    await fn();
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

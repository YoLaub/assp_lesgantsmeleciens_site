// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  getAdherents: vi.fn(), getById: vi.fn(), patch: vi.fn(), validerDoc: vi.fn(), notifierRejet: vi.fn(),
  sendValide: vi.fn(), sendRejete: vi.fn(), sendBonCaf: vi.fn(), sendRejet: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: h.auth }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/shared/lib/mail', () => ({
  sendDocumentValide: h.sendValide, sendDocumentRejete: h.sendRejete,
  sendBonCafValide: h.sendBonCaf, sendNotificationRejetDossier: h.sendRejet,
}));
vi.mock('../domain/use-cases/admin/get-adherents.use-case', () => ({ getAdherentsUseCase: h.getAdherents }));
vi.mock('../domain/use-cases/admin/get-adherent-by-id.use-case', () => ({ getAdherentByIdUseCase: h.getById }));
vi.mock('../domain/use-cases/admin/patch-adherent.use-case', () => ({ patchAdherentUseCase: h.patch }));
vi.mock('../domain/use-cases/admin/valider-document.use-case', () => ({ validerDocumentUseCase: h.validerDoc }));
vi.mock('../domain/use-cases/admin/notifier-rejet-dossier.use-case', () => ({ notifierRejetDossierUseCase: h.notifierRejet }));

import * as actions from './admin-adherents.actions';

beforeEach(() => {
  vi.clearAllMocks();
  h.auth.mockResolvedValue({ userId: 'admin-1' });
});

describe('garde admin', () => {
  it('rejette un utilisateur non authentifié', async () => {
    h.auth.mockResolvedValue({ userId: null });
    await expect(actions.getAdherentsAction()).rejects.toThrow('Non autorisé');
  });
});

describe('lecture', () => {
  it('getAdherentsAction délègue au use-case', async () => {
    h.getAdherents.mockResolvedValue([]);
    expect(await actions.getAdherentsAction()).toEqual([]);
  });
  it('getAdherentByIdAction délègue', async () => {
    h.getById.mockResolvedValue({ id: 1 });
    expect(await actions.getAdherentByIdAction(1)).toEqual({ id: 1 });
  });
});

describe('patchAdherentAction', () => {
  it('valide et applique les données', async () => {
    expect(await actions.patchAdherentAction(1, { reglementSigne: 'valide' })).toEqual({ success: true });
    expect(h.patch).toHaveBeenCalled();
  });
  it('rejette des données invalides', async () => {
    const res = await actions.patchAdherentAction(1, { reglementSigne: 'n_importe_quoi' } as never);
    expect(res).toEqual({ success: false, error: 'Données invalides' });
  });
});

describe('validerDocumentAdminAction', () => {
  it('envoie l\'email de validation document', async () => {
    h.validerDoc.mockResolvedValue({ email: 'a@t.fr', prenom: 'A' });
    const res = await actions.validerDocumentAdminAction(1, 'certificatMedical', 'valide');
    expect(res).toEqual({ success: true });
    expect(h.sendValide).toHaveBeenCalled();
  });

  it('envoie les instructions CAF pour le bon CAF validé', async () => {
    h.validerDoc.mockResolvedValue({ email: 'a@t.fr', prenom: 'A' });
    await actions.validerDocumentAdminAction(1, 'bonCaf', 'valide');
    expect(h.sendBonCaf).toHaveBeenCalled();
  });

  it('envoie l\'email de rejet quand statut non_fourni', async () => {
    h.validerDoc.mockResolvedValue({ email: 'a@t.fr', prenom: 'A' });
    await actions.validerDocumentAdminAction(1, 'certificatMedical', 'non_fourni');
    expect(h.sendRejete).toHaveBeenCalled();
  });

  it('échoue si adhérent introuvable', async () => {
    h.validerDoc.mockResolvedValue({ email: null, prenom: null });
    expect(await actions.validerDocumentAdminAction(1, 'certificatMedical', 'valide')).toMatchObject({ success: false });
  });
});

describe('notifierRejetDossierAction', () => {
  it('notifie le rejet', async () => {
    h.notifierRejet.mockResolvedValue({ email: 'a@t.fr', prenom: 'A' });
    expect(await actions.notifierRejetDossierAction(1)).toEqual({ success: true });
    expect(h.sendRejet).toHaveBeenCalled();
  });
  it('capture une erreur', async () => {
    h.notifierRejet.mockRejectedValue(new Error('introuvable'));
    expect(await actions.notifierRejetDossierAction(1)).toMatchObject({ success: false });
  });
});

describe('exportAdherentsCsvAction', () => {
  it('génère un CSV avec en-têtes et nom de fichier daté', async () => {
    h.getAdherents.mockResolvedValue([{
      membre: { numeroAdherent: 'ADH-1', nom: 'Test', prenom: 'Alice', dateDeNaissance: new Date('2000-01-01') },
      categorie: 'adulte', montantSnapshot: 140, typePaiement: 'en_ligne', inscriptionValide: true,
      dateInscription: new Date('2025-09-01'), reglementSigne: 'declare', certificatMedical: 'valide',
      certificatMedicalReq: true, autorisationSortieSeul: false, couponSport: 'non_fourni', bonCaf: 'non_fourni',
    }]);
    const res = await actions.exportAdherentsCsvAction();
    expect(res.filename).toMatch(/^adherents_\d{4}-\d{2}-\d{2}\.csv$/);
    expect(res.csv).toContain('Numéro adhérent');
    expect(res.csv).toContain('ADH-1');
    expect(res.csv).toContain('Non autorisé');
  });

  it('gère les champs nuls/optionnels (fallbacks)', async () => {
    h.getAdherents.mockResolvedValue([{
      membre: { numeroAdherent: null, nom: 'Test', prenom: 'Bob', dateDeNaissance: null },
      categorie: null, montantSnapshot: null, typePaiement: null, inscriptionValide: false,
      dateInscription: null, reglementSigne: 'non_fourni', certificatMedical: 'non_fourni',
      certificatMedicalReq: false, autorisationSortieSeul: null, couponSport: 'non_fourni', bonCaf: 'non_fourni',
    }]);
    const res = await actions.exportAdherentsCsvAction();
    expect(res.csv).toContain('Bob');
    expect(res.csv).toContain('Non renseigné');
  });
});

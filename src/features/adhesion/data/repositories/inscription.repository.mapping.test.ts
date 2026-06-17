// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const ds = vi.hoisted(() => ({
  findById: vi.fn(), findCurrentByMembreId: vi.fn(), findByToken: vi.fn(),
  findByStripeSessionId: vi.fn(), findAllAdherents: vi.fn(), findAdherentById: vi.fn(),
  create: vi.fn(), update: vi.fn(), createPresence: vi.fn(), createDocument: vi.fn(),
  deleteDocumentsByType: vi.fn(), getCurrentSaison: vi.fn(),
}));
vi.mock('../datasources/inscription.postgres.datasource', () => ({ inscriptionDataSource: ds }));

import { inscriptionRepository } from './inscription.repository.impl';

const membreRaw = {
  id: 'm-1', nom: 'Test', prenom: 'Alice', email: 'a@t.fr', telephone: '06', sexe: 'F',
  codeInsee: '59350', commune: { nom: 'Lille' }, codePostal: '59000', adresse: '1 rue',
  dateDeNaissance: new Date('2000-01-01'), numeroAdherent: 'ADH-1', accesToken: null,
  accesTokenExpireLe: null, dateCreation: new Date(),
};

const rawFull = {
  id: 1, statut: 'ACTIF', photo: null, certificatMedical: 'non_fourni', certificatMedicalReq: false,
  engagementPrisConnaissance: false, autorisationParentale: 'non_fourni', autorisationSortieSeul: true,
  couponSport: 'non_fourni', bonCaf: 'non_fourni', codePassSport: null, montantSnapshot: 140,
  inscriptionValide: false, fnsmr: false, droitImage: false, reglementSigne: 'declare', oxygene: false,
  renouvellement: false, typePaiement: 'en_ligne', accesBloque: false, telephone2: null, stripeSessionId: null,
  categorie: 'adulte', nombrePresences: 0, dateInscription: new Date(), saison: '2025-2026', membreId: 'm-1',
  membre: membreRaw,
  presences: [{ id: 1, pointeLe: new Date(), pointePar: 'Coach', inscriptionId: 1 }],
  documents: [{ id: 'd1', type: 'ID_PHOTO', name: null, url: 'http://x', createdAt: new Date(), inscriptionId: 1 }],
  questionnaire: { id: 7, type: 'majeur', reponses: [{ questionId: 1, reponse: true }] },
};

beforeEach(() => vi.clearAllMocks());

describe('inscriptionRepository — mapping & méthodes', () => {
  it('findById mappe membre, présences, documents et questionnaire', async () => {
    ds.findById.mockResolvedValue(rawFull);
    const r = await inscriptionRepository.findById(1);
    expect(r).toMatchObject({ id: 1, autorisationSortieSeul: true, montantSnapshot: 140 });
    expect(r!.membre.communeNom).toBe('Lille');
    expect(r!.presences).toHaveLength(1);
    expect(r!.documents).toHaveLength(1);
    expect(r!.questionnaire).toEqual({ id: 7, type: 'majeur', reponses: [{ questionId: 1, reponse: true }] });
  });

  it('findById retourne null si absent', async () => {
    ds.findById.mockResolvedValue(null);
    expect(await inscriptionRepository.findById(1)).toBeNull();
  });

  it('findByToken / findAdherentById mappent en détails', async () => {
    ds.findByToken.mockResolvedValue(rawFull);
    ds.findAdherentById.mockResolvedValue({ ...rawFull, questionnaire: null });
    expect((await inscriptionRepository.findByToken('tok'))?.id).toBe(1);
    const adh = await inscriptionRepository.findAdherentById(1);
    expect(adh?.questionnaire).toBeNull();
  });

  it('findCurrentByMembreId mappe à plat (null safe)', async () => {
    ds.findCurrentByMembreId.mockResolvedValue(rawFull);
    expect((await inscriptionRepository.findCurrentByMembreId('m-1'))?.id).toBe(1);
    ds.findCurrentByMembreId.mockResolvedValue(null);
    expect(await inscriptionRepository.findCurrentByMembreId('m-1')).toBeNull();
  });

  it('findAllAdherents mappe la liste', async () => {
    ds.findAllAdherents.mockResolvedValue([rawFull]);
    expect(await inscriptionRepository.findAllAdherents()).toHaveLength(1);
  });

  it('create transmet tous les champs optionnels présents', async () => {
    ds.create.mockResolvedValue(rawFull);
    await inscriptionRepository.create({
      statut: 'ACTIF', saison: '2025-2026', membreId: 'm-1', categorie: 'adulte',
      oxygene: true, renouvellement: true, couponSport: 'declare', bonCaf: 'declare',
      codePassSport: 'PS1', montantSnapshot: 140, dateInscription: new Date(),
    });
    const arg = ds.create.mock.calls[0][0];
    expect(arg).toMatchObject({ categorie: 'adulte', oxygene: true, renouvellement: true, couponSport: 'declare', codePassSport: 'PS1' });
  });

  it('create omet les champs optionnels absents', async () => {
    ds.create.mockResolvedValue(rawFull);
    await inscriptionRepository.create({ statut: 'ESSAYANT', saison: '2025-2026', membreId: 'm-1' });
    const arg = ds.create.mock.calls[0][0];
    expect(arg).not.toHaveProperty('codePassSport');
    expect(arg).not.toHaveProperty('categorie');
  });

  it('update retire id/membreId avant de transmettre', async () => {
    ds.update.mockResolvedValue(rawFull);
    await inscriptionRepository.update(1, { reglementSigne: 'valide', membreId: 'hack' } as never);
    const [id, data] = ds.update.mock.calls[0];
    expect(id).toBe(1);
    expect(data).not.toHaveProperty('membreId');
    expect(data).toMatchObject({ reglementSigne: 'valide' });
  });

  it('createPresence et createDocument mappent le résultat', async () => {
    ds.createPresence.mockResolvedValue({ id: 2, pointeLe: new Date(), pointePar: 'C', inscriptionId: 1 });
    ds.createDocument.mockResolvedValue({ id: 'd2', type: 'ID_PHOTO', name: null, url: 'u', createdAt: new Date(), inscriptionId: 1 });
    expect((await inscriptionRepository.createPresence(1, 'C')).id).toBe(2);
    expect((await inscriptionRepository.createDocument(1, 'ID_PHOTO', 'u', 'photo.jpg')).id).toBe('d2');
  });

  it('deleteDocumentsByType délègue', async () => {
    await inscriptionRepository.deleteDocumentsByType(1, 'ID_PHOTO');
    expect(ds.deleteDocumentsByType).toHaveBeenCalledWith(1, 'ID_PHOTO');
  });
});

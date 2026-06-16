// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';

const ds = vi.hoisted(() => ({
  findById: vi.fn(), findByEmail: vi.fn(), findByToken: vi.fn(),
  findByEmailAndNumero: vi.fn(), create: vi.fn(), update: vi.fn(), findUniqueNumero: vi.fn(),
}));
vi.mock('../datasources/membre.postgres.datasource', () => ({ membreDataSource: ds }));

import { membreRepository } from './membre.repository.impl';

const raw = {
  id: 'm-1', nom: 'Test', prenom: 'Alice', email: 'a@t.fr', telephone: '06', sexe: 'F',
  codeInsee: '59350', commune: { nom: 'Lille' }, codePostal: '59000', adresse: '1 rue',
  dateDeNaissance: new Date('2000-01-01'), numeroAdherent: 'ADH-1', accesToken: null,
  accesTokenExpireLe: null, dateCreation: new Date(),
};

beforeEach(() => vi.clearAllMocks());

describe('membreRepository (mapping + délégation)', () => {
  it('findById mappe la commune en communeNom', async () => {
    ds.findById.mockResolvedValue(raw);
    const m = await membreRepository.findById('m-1');
    expect(m).toMatchObject({ id: 'm-1', communeNom: 'Lille', codePostal: '59000' });
  });

  it('findById retourne null si absent', async () => {
    ds.findById.mockResolvedValue(null);
    expect(await membreRepository.findById('x')).toBeNull();
  });

  it('findByEmail / findByToken / findByEmailAndNumero délèguent', async () => {
    ds.findByEmail.mockResolvedValue(raw);
    ds.findByToken.mockResolvedValue(null);
    ds.findByEmailAndNumero.mockResolvedValue(raw);
    expect((await membreRepository.findByEmail('a@t.fr'))?.id).toBe('m-1');
    expect(await membreRepository.findByToken('tok')).toBeNull();
    expect((await membreRepository.findByEmailAndNumero('a@t.fr', 'ADH-1'))?.id).toBe('m-1');
  });

  it('findAllWithInscription retourne un tableau vide', async () => {
    expect(await membreRepository.findAllWithInscription()).toEqual([]);
  });

  it('create mappe le membre créé', async () => {
    ds.create.mockResolvedValue(raw);
    const m = await membreRepository.create({ nom: 'Test', prenom: 'Alice', email: 'a@t.fr', telephone: '06', dateDeNaissance: new Date(), numeroAdherent: 'ADH-1', accesToken: 't', accesTokenExpireLe: new Date() });
    expect(m.numeroAdherent).toBe('ADH-1');
  });

  it('updateToken délègue au datasource', async () => {
    const exp = new Date();
    await membreRepository.updateToken('m-1', 'tok', exp);
    expect(ds.update).toHaveBeenCalledWith('m-1', { accesToken: 'tok', accesTokenExpireLe: exp });
  });

  it('generateUniqueNumero réessaie tant que le numéro existe', async () => {
    ds.findUniqueNumero.mockResolvedValueOnce({ id: 'x' }).mockResolvedValueOnce(null);
    const numero = await membreRepository.generateUniqueNumero();
    expect(numero).toMatch(/^ADH-[A-Z0-9]{5}$/);
    expect(ds.findUniqueNumero).toHaveBeenCalledTimes(2);
  });
});

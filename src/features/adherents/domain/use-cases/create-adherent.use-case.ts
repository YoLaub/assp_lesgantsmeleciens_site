import { membreRepository } from '@/features/adhesion/data/repositories/membre.repository.impl';
import { inscriptionRepository } from '@/features/adhesion/data/repositories/inscription.repository.impl';
import { calculerCategorie } from '@/shared/lib/adherent-utils';
import { hashToken } from '@/shared/lib/token';
import { prisma } from '@/shared/lib/prisma';
import type { StatutDocument } from '@/features/adhesion/domain/models/inscription.model';

export interface CreateAdherentInput {
  nom: string;
  prenom: string;
  dateDeNaissance: Date;
  sexe: string;
  email: string;
  telephone?: string;
  oxygene: boolean;
  couponSport: boolean;
  bonCaf: boolean;
  codePassSport?: string;
  membreId?: string;  // fourni si conversion depuis ESSAYANT
}

export async function createAdherentUseCase(input: CreateAdherentInput) {
  const categorie = calculerCategorie(input.dateDeNaissance);
  const saison = await inscriptionRepository.getCurrentSaison();

  const config = await prisma.configTarifs.findFirst({ orderBy: { id: 'desc' } });
  if (!config) throw new Error('Configuration des tarifs introuvable');

  const tarifBase = categorie === 'enfant'
    ? Number(config.tarifEnfant)
    : categorie === 'ados'
      ? Number(config.tarifAdos)
      : Number(config.tarifAdulte);
  let montant = tarifBase;
  if (input.oxygene) montant += Number(config.supplementOxygene);
  if (input.couponSport) montant -= Number(config.deductionCouponSport);

  // Vérifier renouvellement
  const existant = await prisma.inscription.findFirst({
    where: { membre: { email: input.email }, inscriptionValide: true },
    select: { id: true },
  });
  const renouvellement = existant !== null;

  if (input.membreId) {
    // Conversion ESSAYANT → ACTIF : mettre à jour l'inscription existante
    const inscriptionExistante = await inscriptionRepository.findCurrentByMembreId(input.membreId);
    if (!inscriptionExistante) throw new Error('Inscription essayant introuvable');

    await prisma.membre.update({
      where: { id: input.membreId },
      data: { nom: input.nom, prenom: input.prenom, email: input.email, dateDeNaissance: input.dateDeNaissance, sexe: input.sexe ?? null, ...(input.telephone ? { telephone: input.telephone } : {}) },
    });

    await inscriptionRepository.update(inscriptionExistante.id, {
      statut: 'ACTIF',
      categorie,
      oxygene: input.oxygene,
      renouvellement,
      couponSport: (input.couponSport ? 'declare' : 'non_fourni') as StatutDocument,
      bonCaf: (input.bonCaf ? 'declare' : 'non_fourni') as StatutDocument,
      ...(input.codePassSport ? { codePassSport: input.codePassSport } : {}),
      montantSnapshot: montant,
      dateInscription: new Date(),
    });

    const membre = await membreRepository.findById(input.membreId);
    return { membre: membre!, numeroAdherent: membre!.numeroAdherent!, montant, categorie };
  }

  // Nouvelle inscription directe
  const numeroAdherent = await membreRepository.generateUniqueNumero();
  const membre = await membreRepository.create({
    nom: input.nom,
    prenom: input.prenom,
    email: input.email,
    telephone: input.telephone,
    dateDeNaissance: input.dateDeNaissance,
    numeroAdherent,
    accesToken: hashToken(crypto.randomUUID()),
    accesTokenExpireLe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  if (input.sexe) {
    await prisma.membre.update({ where: { id: membre.id }, data: { sexe: input.sexe } });
  }

  await inscriptionRepository.create({
    statut: 'ACTIF',
    saison,
    membreId: membre.id,
    categorie,
    oxygene: input.oxygene,
    renouvellement,
    couponSport: (input.couponSport ? 'declare' : 'non_fourni') as StatutDocument,
    bonCaf: (input.bonCaf ? 'declare' : 'non_fourni') as StatutDocument,
    ...(input.codePassSport ? { codePassSport: input.codePassSport } : {}),
    montantSnapshot: montant,
    dateInscription: new Date(),
  });

  return { membre, numeroAdherent, montant, categorie };
}

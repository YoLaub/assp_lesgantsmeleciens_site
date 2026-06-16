import { prisma } from '@/shared/lib/prisma';

export interface UpdateAdresseInput {
  adresse: string;
  codePostal: string;
  codeInsee: string;
  communeNom: string;
}

export async function updateAdresseUseCase(membreId: string, data: UpdateAdresseInput) {
  await prisma.commune.upsert({
    where: { codeInsee: data.codeInsee },
    update: { nom: data.communeNom },
    create: { codeInsee: data.codeInsee, nom: data.communeNom },
  });
  await prisma.membre.update({
    where: { id: membreId },
    data: { adresse: data.adresse, codePostal: data.codePostal, codeInsee: data.codeInsee },
  });
}

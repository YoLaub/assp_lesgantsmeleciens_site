import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { hashToken } from '@/shared/lib/token';

export const membreDataSource = {
  findById(id: string) {
    return prisma.membre.findUnique({ where: { id }, include: { commune: true } });
  },

  findByEmail(email: string) {
    return prisma.membre.findFirst({ where: { email }, include: { commune: true } });
  },

  findByToken(token: string) {
    return prisma.membre.findFirst({
      where: { accesToken: hashToken(token), accesTokenExpireLe: { gt: new Date() } },
      include: { commune: true },
    });
  },

  findByEmailAndNumero(email: string, numeroAdherent: string) {
    return prisma.membre.findFirst({ where: { email, numeroAdherent }, include: { commune: true } });
  },

  create(data: Prisma.MembreCreateInput) {
    return prisma.membre.create({ data, include: { commune: true } });
  },

  update(id: string, data: Prisma.MembreUpdateInput) {
    return prisma.membre.update({ where: { id }, data });
  },

  findUniqueNumero(numero: string) {
    return prisma.membre.findUnique({ where: { numeroAdherent: numero }, select: { id: true } });
  },
};

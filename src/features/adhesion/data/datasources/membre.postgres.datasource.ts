import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { hashToken } from '@/shared/lib/token';

export const membreDataSource = {
  findById(id: string) {
    return prisma.membre.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.membre.findFirst({ where: { email } });
  },

  findByToken(token: string) {
    return prisma.membre.findFirst({
      where: { accesToken: hashToken(token), accesTokenExpireLe: { gt: new Date() } },
    });
  },

  findByEmailAndNumero(email: string, numeroAdherent: string) {
    return prisma.membre.findFirst({ where: { email, numeroAdherent } });
  },

  create(data: Prisma.MembreCreateInput) {
    return prisma.membre.create({ data });
  },

  update(id: string, data: Prisma.MembreUpdateInput) {
    return prisma.membre.update({ where: { id }, data });
  },

  findUniqueNumero(numero: string) {
    return prisma.membre.findUnique({ where: { numeroAdherent: numero }, select: { id: true } });
  },
};

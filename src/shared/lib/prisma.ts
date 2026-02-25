import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPostgresAdapter } from "@prisma/adapter-ppg";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient;
};

// Configuration de l'adaptateur Serverless spécifique à Prisma Postgres
const adapter = new PrismaPostgresAdapter({
    connectionString: process.env.DATABASE_URL || '', // Ou PRISMA_DIRECT_TCP_URL selon comment tu l'as nommée
});

// Instanciation avec le bon adaptateur
export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
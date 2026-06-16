import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        mockReset: true,
        coverage: {
            provider: 'v8',
            reporter: ['text-summary', 'text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            // Le seuil 80 % cible la LOGIQUE MÉTIER (use-cases, repositories,
            // datasources, server actions, helpers). Les composants React
            // (presentation/**) et les pages (app/**, hors actions) sont exclus :
            // ils relèvent de tests de composants/e2e, hors de ce périmètre.
            include: [
                'src/features/**/domain/**',
                'src/features/**/data/**',
                'src/features/**/actions/**',
                'src/app/**/actions/**',
                'src/shared/lib/**',
            ],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                'src/**/*.d.ts',
                'src/**/__tests__/**',
                'src/**/__mocks__/**',
                'src/**/*.model.ts',                 // types/interfaces purs
                'src/features/**/domain/repositories/**', // interfaces de repository
                // Infra : testée en intégration (Postgres Docker / SDK externes),
                // pas en unitaire — exclue de la porte de couverture.
                'src/features/**/data/datasources/**', // requêtes Prisma brutes
                'src/shared/lib/prisma.ts',          // singleton client Prisma
                'src/shared/lib/result.ts',          // ré-exports neverthrow
                'src/shared/lib/upload.ts',          // SDK AWS S3 / R2
                'src/shared/lib/cloudinary.ts',      // SDK Cloudinary
                'src/shared/lib/cloudinary.server.ts',
                'src/shared/lib/rate-limit.ts',      // SDK Upstash Redis
            ],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80,
            },
        },
    },
});

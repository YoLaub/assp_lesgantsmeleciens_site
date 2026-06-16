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
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/generated/**',          // client Prisma généré
                'src/**/*.test.{ts,tsx}',
                'src/**/*.d.ts',
                'src/**/__tests__/**',
                'src/**/__mocks__/**',
            ],
            // Seuil global de 80 % : `vitest run --coverage` échoue en dessous.
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80,
            },
        },
    },
});

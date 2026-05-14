import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/**/__tests__/**', 'scripts/**/__tests__/**', 'src/index.ts', 'src/styles/**'],
      include: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: '.logs/coverage/unit',
    },
    environment: 'node',
    globals: false,
    include: [
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'scripts/**/__tests__/**/*.{test,spec}.mjs',
      'tests/**/*.test.ts',
    ],
  },
});

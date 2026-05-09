import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/**/__tests__/**', 'src/index.ts', 'src/styles/**'],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: '.logs/coverage/unit',
    },
    environment: 'node',
    globals: false,
    include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}'],
  },
});

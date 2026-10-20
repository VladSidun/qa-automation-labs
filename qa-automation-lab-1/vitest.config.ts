import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Перевіряємо функції без браузера.
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts'], // Враховуємо лише код модулів.
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 100,
      },
    },
  },
});

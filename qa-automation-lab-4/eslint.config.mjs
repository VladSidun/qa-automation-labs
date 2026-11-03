import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['node_modules/', 'coverage/', 'dist/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
);

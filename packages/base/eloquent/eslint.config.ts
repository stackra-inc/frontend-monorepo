/**
 * ESLint configuration for @stackra/ts-eloquent
 *
 * Standalone flat config — uses typescript-eslint directly to avoid
 * pulling in monorepo-only plugins (turbo, etc.) that may not resolve
 * correctly in an independent package.
 *
 * Rule philosophy for an ORM:
 * - `Function` type is intentional for constructor references and decorators
 * - `this` aliasing is used in query builder chains
 * - `any` is unavoidable in dynamic model/schema resolution
 *
 * @module eslint.config
 */

import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── Ignore patterns ──────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.examples/**', 'eslint.config.ts'],
  },

  // ── TypeScript source files ───────────────────────────────────────────────
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ── Intentionally off for ORM internals ────────────────────────────
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-console': 'off',

      // ── Errors ─────────────────────────────────────────────────────────
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': true,
          minimumDescriptionLength: 10,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  }
);

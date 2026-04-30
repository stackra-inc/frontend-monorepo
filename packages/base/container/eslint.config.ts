/**
 * ESLint configuration for @stackra/ts-container
 *
 * Standalone flat config — does not extend the monorepo shared config
 * to avoid pulling in monorepo-only plugins (turbo, etc.) that are not
 * installed in this package.
 *
 * Rule philosophy for a DI framework:
 * - `any` is intentional in injector internals where types are erased at runtime
 * - Non-null assertions are intentional where invariants are guaranteed by design
 * - These are turned off rather than warned, since --max-warnings 0 treats
 *   warnings as errors and would block CI on every legitimate use.
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
      // ── Intentionally off for DI internals ─────────────────────────────
      // `any` is unavoidable in a reflection-based DI system where types
      // are erased at runtime (design:paramtypes returns `any[]`)
      '@typescript-eslint/no-explicit-any': 'off',

      // Non-null assertions are used where the DI invariants guarantee
      // a value exists (e.g. after isResolved check, after has() check)
      '@typescript-eslint/no-non-null-assertion': 'off',

      // ── Errors ─────────────────────────────────────────────────────────
      // Prefer @ts-expect-error over @ts-ignore (catches stale suppressions)
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
          'ts-nocheck': true,
          minimumDescriptionLength: 10,
        },
      ],

      // No Function type — use explicit signatures
      '@typescript-eslint/no-unsafe-function-type': 'error',

      // Unused vars — allow _ prefix for intentionally unused params
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // No require() — ESM only
      '@typescript-eslint/no-require-imports': 'error',

      // Consistent type imports
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  }
);

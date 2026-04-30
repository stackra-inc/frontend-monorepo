/**
 * @fileoverview ESLint configuration for @stackra/react-i18n package
 *
 * This configuration extends the shared @stackra/eslint-config with
 * project-specific ignore patterns. Uses the ESLint flat config format.
 *
 * @module @stackra/react-i18n
 * @category Configuration
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 */

// Import the Linter type for type-safe configuration
import type { Linter } from 'eslint';

// Import the shared Vite-optimized ESLint configuration from @stackra/eslint-config.
import { viteConfig } from '@stackra/eslint-config';

const config: Linter.Config[] = [
  // Spread the shared Stackra ESLint configuration.
  ...viteConfig,

  // Files and directories excluded from linting
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts', '.examples/**'],
  },

  // Package-specific rule overrides
  {
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default config;

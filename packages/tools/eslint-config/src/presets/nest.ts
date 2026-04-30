import js from '@eslint/js';
import globals from 'globals';
import type { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import nestjsTyped from '@darraghor/eslint-plugin-nestjs-typed';

import { config as baseConfig } from './base';

/**
 * NestJS ESLint Configuration Array
 *
 * ESLint configuration for NestJS applications and libraries.
 * Extends base config with Node.js environment settings.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. Base config (TypeScript, Prettier, Turbo)
 * 2. ESLint recommended rules
 * 3. Prettier integration
 * 4. TypeScript rules with decorator support
 * 5. Node.js + ES2022 globals
 * 6. Ignore patterns (dist, coverage)
 *
 * @example
 * ```typescript
 * import { config as nestConfig } from '@stackra/eslint-config/nestjs';
 *
 * export default [
 *   ...nestConfig,
 *   {
 *     rules: {
 *       // NestJS-specific overrides
 *     }
 *   }
 * ];
 * ```
 */
export const config: Linter.Config[] = [
  // Inherit all base configuration rules
  // Includes TypeScript, Prettier, Turbo, and core ESLint rules
  ...baseConfig,

  // Core JavaScript linting rules
  js.configs.recommended,

  // Prettier integration to prevent formatting conflicts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eslintConfigPrettier as any,

  // TypeScript recommended rules
  // Essential for NestJS which heavily uses TypeScript decorators
  ...tseslint.configs.recommended,

  // NestJS-specific linting rules
  // Catches common NestJS issues at build time:
  // - DI issues (missing providers, mismatched injections)
  // - Swagger/OpenAPI decorator issues
  // - Security issues (class-transformer CVE)
  // - Validation decorator issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(nestjsTyped.configs.flatRecommended as any),

  // Node.js environment configuration
  // Provides global variables and APIs available in Node.js runtime
  {
    languageOptions: {
      globals: {
        // Node.js built-in globals (process, Buffer, __dirname, etc.)
        ...globals.node,
        // Modern JavaScript features (Promise, Symbol, BigInt, etc.)
        ...globals.es2022,
      },
    },
    rules: {
      // TypeScript-specific rules for better code quality
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // NestJS-specific rules from typed plugin
      // '@darraghor/typed/injectable-should-be-provided': 'error',
      '@darraghor/typed/injectable-should-be-provided': [
        'error',
        {
          src: ['src/**/*.ts'],
          filterFromPaths: [
            '.test.',
            '.spec.',
            'node_modules',
            'vitest.config.ts',
            'tsconfig.spec.json',
            'tsconfig.scripts.json',
          ],
        },
      ],

      // Security rules - prevent dangerous code patterns
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
    },
  },

  // Ignore patterns for NestJS projects
  // Excludes build output and test coverage from linting
  {
    ignores: [
      'dist/**', // Compiled JavaScript output
      'coverage/**', // vitest coverage reports
    ],
  },
];

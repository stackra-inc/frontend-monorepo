import js from '@eslint/js';
import type { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import turboPlugin from 'eslint-plugin-turbo';
import onlyWarn from 'eslint-plugin-only-warn';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * Base ESLint Configuration Array
 *
 * Foundation configuration for all TypeScript packages in the monorepo.
 * Provides core linting rules with monorepo-specific enhancements.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. ESLint recommended rules for JavaScript
 * 2. Prettier integration (disables conflicting rules)
 * 3. TypeScript ESLint recommended rules
 * 4. Turborepo plugin (monorepo best practices)
 * 5. Only-warn plugin (converts errors to warnings)
 * 6. Ignore patterns (excludes build output)
 *
 * @example
 * ```typescript
 * import { config as baseConfig } from '@stackra/eslint-config/base';
 *
 * export default [
 *   ...baseConfig,
 *   {
 *     // Add custom rules
 *   }
 * ];
 * ```
 */
export const config: Linter.Config[] = [
  // Core ESLint recommended rules for JavaScript
  // Provides fundamental linting for common JavaScript issues
  js.configs.recommended,

  // Prettier integration - disables ESLint rules that conflict with Prettier
  // This prevents conflicts between ESLint formatting and Prettier formatting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eslintConfigPrettier as any,

  // TypeScript ESLint recommended rules
  // Adds TypeScript-aware linting rules for type safety
  ...tseslint.configs.recommended,

  // Turborepo plugin configuration
  // Enforces monorepo best practices and environment variable tracking
  // Warns when environment variables are used but not declared in turbo.json
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      turbo: turboPlugin as any,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },

  // Only-warn plugin configuration
  // Converts all ESLint errors to warnings for a less disruptive developer experience
  // This allows developers to see issues without breaking their workflow
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onlyWarn: onlyWarn as any,
    },
  },

  // Ignore patterns
  // Exclude build output and generated files from linting
  {
    ignores: [
      'dist/**', // Build output directory
    ],
  },
];

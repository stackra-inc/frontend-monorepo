import js from '@eslint/js';
import globals from 'globals';
import type { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

import { config as baseConfig } from './base';

/**
 * Vite ESLint Configuration Array
 *
 * Optimized linting setup for Vite-powered applications with React and TypeScript.
 * Includes browser environment and bundler-specific optimizations.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. Base config (TypeScript, Prettier, Turbo)
 * 2. ESLint recommended rules
 * 3. Prettier integration
 * 4. TypeScript rules
 * 5. React config with browser globals
 * 6. React Hooks rules
 * 7. Vite-specific optimizations
 * 8. React auto-import disabled
 *
 * @example
 * ```typescript
 * import { config as viteConfig } from '@stackra/eslint-config/vite';
 *
 * export default [
 *   ...viteConfig,
 *   {
 *     rules: {
 *       // Vite app-specific overrides
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
  // Critical for Vite TypeScript projects
  ...tseslint.configs.recommended,

  // React configuration with browser support
  // Enables JSX syntax and React-specific rules
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(pluginReact.configs.flat.recommended as any),
    languageOptions: {
      // Inherit React's language options (JSX parser, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(pluginReact.configs.flat.recommended as any).languageOptions,
      globals: {
        // Browser APIs for client-side code
        // (window, document, navigator, localStorage, fetch, etc.)
        ...globals.browser,
        // Modern JavaScript features
        ...globals.es2022,
      },
    },
  },

  // React Hooks rules enforcement
  // Ensures proper usage of useState, useEffect, useMemo, etc.
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'react-hooks': pluginReactHooks as any,
    },
    settings: {
      // Automatically detect React version to apply version-specific rules
      react: { version: 'detect' },
    },
    rules: {
      // React Hooks rules (dependencies, exhaustive-deps, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(pluginReactHooks.configs.recommended as any).rules,
      // Disable React import requirement (Vite auto-imports React with new JSX transform)
      'react/react-in-jsx-scope': 'off',
      // Relax prop-types requirement (TypeScript handles this)
      'react/prop-types': 'off',
    },
  },

  // Vite-specific configurations
  {
    rules: {
      // Allow dynamic imports (Vite code-splitting)
      'import/no-dynamic-require': 'off',
      // Allow console in development (Vite removes in production)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // TypeScript-specific rules for better DX
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
    },
  },

  // Ignore patterns for Vite projects
  {
    ignores: [
      'dist/**', // Build output
      '.vite/**', // Vite cache
      'vite.config.ts.timestamp-*', // Vite timestamp files
    ],
  },
];

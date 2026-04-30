import js from '@eslint/js';
import globals from 'globals';
import type { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginNext from '@next/eslint-plugin-next';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

import { config as baseConfig } from './base';

/**
 * Next.js ESLint Configuration Array
 *
 * Comprehensive linting setup for Next.js applications with React, TypeScript,
 * and Next.js-specific rules.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. Base config (TypeScript, Prettier, Turbo)
 * 2. ESLint recommended rules
 * 3. Prettier integration
 * 4. TypeScript rules
 * 5. React config with service worker globals
 * 6. Next.js plugin (best practices + Core Web Vitals)
 * 7. React Hooks rules
 * 8. React auto-import disabled
 *
 * @example
 * ```typescript
 * import { nextJsConfig } from '@stackra/eslint-config/next';
 *
 * export default [
 *   ...nextJsConfig,
 *   {
 *     rules: {
 *       // Next.js app-specific overrides
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
  // Critical for Next.js TypeScript projects
  ...tseslint.configs.recommended,

  // React configuration with service worker support
  // Enables JSX syntax and React-specific rules
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(pluginReact.configs.flat.recommended as any),
    languageOptions: {
      // Inherit React's language options (JSX parser, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(pluginReact.configs.flat.recommended as any).languageOptions,
      globals: {
        // Service Worker APIs for PWA support
        // (self, caches, skipWaiting, clients, etc.)
        ...globals.serviceworker,
      },
    },
  },

  // Next.js-specific linting rules
  // Enforces Next.js best practices and Core Web Vitals optimization
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      '@next/next': pluginNext as any,
    },
    rules: {
      // General Next.js rules (Link usage, Image optimization, etc.)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(pluginNext.configs.recommended as any).rules,
      // Core Web Vitals rules (performance, accessibility, best practices)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(pluginNext.configs['core-web-vitals'] as any).rules,
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
      // Disable React import requirement (Next.js auto-imports React)
      'react/react-in-jsx-scope': 'off',
    },
  },
];

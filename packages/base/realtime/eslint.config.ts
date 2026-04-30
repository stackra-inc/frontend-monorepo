/**
 * @fileoverview ESLint configuration for @stackra/ts-realtime
 * @module eslint.config
 */

import type { Linter } from 'eslint';
import { viteConfig } from '@stackra/eslint-config';

const config: Linter.Config[] = [
  ...viteConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts', '.examples/**'],
  },
  {
    rules: {
      'turbo/no-undeclared-env-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;

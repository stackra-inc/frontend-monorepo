/**
 * @fileoverview ESLint configuration for @stackra/react-ticket package
 *
 * Extends the shared @nesvel/eslint-config with project-specific
 * ignore patterns. Uses the ESLint flat config format.
 *
 * @module @stackra/react-ticket
 * @category Configuration
 */

import type { Linter } from 'eslint';
import { viteConfig } from '@nesvel/eslint-config';

const config: Linter.Config[] = [
  ...viteConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
  {
    rules: {},
  },
];

export default config;

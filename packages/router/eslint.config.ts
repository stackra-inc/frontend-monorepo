/**
 * @fileoverview ESLint configuration for @stackra-inc/react-router package.
 * @module @stackra-inc/react-router
 * @category Configuration
 */
import type { Linter } from 'eslint';
import { viteConfig } from '@nesvel/eslint-config';

const config: Linter.Config[] = [
  ...viteConfig,
  { ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'] },
  { rules: {} },
];
export default config;

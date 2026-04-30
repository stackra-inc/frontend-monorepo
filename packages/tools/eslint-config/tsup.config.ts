import { defineConfig } from 'tsup';
import { basePreset } from '@stackra/tsup-config';

/**
 * Build configuration for @stackra/eslint-config
 *
 * Uses the base preset which:
 * - Outputs both ESM and CJS formats
 * - Generates TypeScript declarations
 * - Bundles all dependencies for standalone use
 */
export default defineConfig({
  ...basePreset,
  external: ['eslint', 'eslint-plugin-turbo', '@babel/preset-typescript/package.json'], // Externalize ESLint and Babel preset package.json
});

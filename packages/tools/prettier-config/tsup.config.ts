import { defineConfig } from 'tsup';
import { basePreset } from '@stackra/tsup-config';

/**
 * Build configuration for @vivel/prettier-config
 *
 Uses the React library preset which:
 * - Outputs both ESM and CJS formats
 * - Externalizes React dependencies
 * - Enables automatic JSX transform
 * - Generates TypeScript declarations
 */
export default defineConfig({
  ...basePreset,
});

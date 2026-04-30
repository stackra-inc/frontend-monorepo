/**
 * @fileoverview tsup build configuration for @stackra/react-i18n
 * @module @stackra/react-i18n
 * @see https://tsup.egoist.dev/
 */

import { defineConfig } from 'tsup';
import { basePreset } from '@stackra/tsup-config';

export default defineConfig({
  ...basePreset,
  entry: ['src/index.ts', 'src/vite.ts'],
});

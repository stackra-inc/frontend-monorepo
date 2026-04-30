/**
 * @fileoverview tsup build configuration for @stackra/ts-container
 *
 * Builds two entry points:
 * - `src/index.ts` → core DI (no React dependency)
 * - `src/react.ts` → React bindings (requires React peer dep)
 *
 * @module @stackra/ts-container
 * @see https://tsup.egoist.dev/
 */

import { basePreset as preset } from '@stackra/tsup-config';

export default {
  ...preset,
  entry: ['src/index.ts', 'src/react.ts'],
};

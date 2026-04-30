import type { Options } from 'tsup';

import { preset as basePreset } from './base';

/**
 * NestJS Library Preset Configuration
 *
 * Tsup options configured for NestJS libraries that require decorator
 * and metadata preservation. Extends base preset with NestJS-specific settings.
 *
 * @type {Options}
 * @constant
 */
export const preset: Options = {
  // Inherit base configuration (ESM + CJS, types, etc.)
  ...basePreset,

  // Don't bundle - preserve module structure for proper tree-shaking
  // This allows consumers to only import what they need
  bundle: false,

  // No code splitting needed for libraries
  splitting: false,

  // Use project's tsconfig.json for proper decorator handling
  // NestJS requires "emitDecoratorMetadata": true
  tsconfig: './tsconfig.json',
};

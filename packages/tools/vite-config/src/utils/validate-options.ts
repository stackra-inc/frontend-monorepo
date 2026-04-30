/**
 * Options Validation Utility
 *
 * Reserved for future validation logic. Currently a no-op since
 * unknown plugin keys are treated as raw Vite plugin pass-throughs.
 *
 * @module utils/validate-options
 */

import type { StackraOptions } from '@/interfaces';

/**
 * Validate StackraOptions.
 *
 * @param _options - The options to validate
 */
export function validateOptions(_options: StackraOptions): void {
  // No validation needed — unknown plugin keys are Vite pass-throughs
}

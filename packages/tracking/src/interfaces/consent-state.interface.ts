/**
 * @fileoverview ConsentState type — maps consent categories to boolean values.
 *
 * Used by {@link ConsentService} to represent the current consent state.
 * Each {@link ConsentCategory} maps to a boolean indicating whether the
 * user has granted consent for that category.
 *
 * @module @stackra/react-tracking
 * @category Interfaces
 */

import type { ConsentCategory } from "@/enums/consent-category.enum";

/**
 * Consent state mapping — each category maps to a boolean.
 *
 * All categories default to `false` (denied) until explicitly granted.
 * This is the strictest GDPR-compliant default.
 *
 * @example
 * ```typescript
 * const state: ConsentState = {
 *   [ConsentCategory.ANALYTICS]: true,
 *   [ConsentCategory.MARKETING]: false,
 *   [ConsentCategory.FUNCTIONAL]: true,
 * };
 * ```
 */
export type ConsentState = Record<ConsentCategory, boolean>;

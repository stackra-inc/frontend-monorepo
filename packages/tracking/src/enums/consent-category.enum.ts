/**
 * @fileoverview ConsentCategory enum — user consent categories.
 *
 * Defines the consent categories used by {@link ConsentService} to gate
 * tracking operations. Each category maps to a specific type of data
 * collection that requires user consent under GDPR/CCPA.
 *
 * @module @stackra/react-tracking
 * @category Enums
 */

/**
 * User consent categories for tracking operations.
 *
 * Used by {@link ConsentService} to manage per-category consent state.
 * All categories default to `false` (denied) until explicitly granted.
 *
 * - `ANALYTICS` — gates identity sync and analytics data collection
 * - `MARKETING` — gates pixel loading, event dispatch, and ad tracking
 * - `FUNCTIONAL` — gates functional cookies and preferences
 */
export enum ConsentCategory {
  /** Analytics data collection (identity sync, page analytics). */
  ANALYTICS = "analytics",

  /** Marketing and advertising (pixel loading, event dispatch). */
  MARKETING = "marketing",

  /** Functional cookies and user preferences. */
  FUNCTIONAL = "functional",
}

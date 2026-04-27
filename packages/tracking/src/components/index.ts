/**
 * Components Barrel Export
 *
 * Consent-related UI components for the tracking package.
 *
 * - {@link ConsentBanner} — fixed-bottom consent prompt with accept/reject
 * - {@link ConsentManager} — per-category consent toggle UI
 * - {@link ConsentGate} — conditional rendering based on consent state
 *
 * All components are headless-style — they provide structure and behavior
 * but minimal styling. Wrap or style them to match your design system.
 *
 * @module components
 */

// ─── Consent Banner ────────────────────────────────────────────────
export { ConsentBanner } from "./consent-banner";
export type { ConsentBannerProps } from "./consent-banner";

// ─── Consent Manager ───────────────────────────────────────────────
export { ConsentManager } from "./consent-manager";
export type { ConsentManagerProps, ConsentCategoryConfig } from "./consent-manager";

// ─── Consent Gate ──────────────────────────────────────────────────
export { ConsentGate } from "./consent-gate";
export type { ConsentGateProps } from "./consent-gate";

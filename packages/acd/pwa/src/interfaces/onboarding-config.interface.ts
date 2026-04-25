/**
 * @fileoverview OnboardingConfig interface — top-level configuration.
 *
 * Controls the overall behavior of the onboarding flow:
 * persistence, animations, theming, and callbacks.
 *
 * @module onboarding/interfaces/onboarding-config
 */

import type { ReactNode } from 'react';

/**
 * Top-level configuration for the onboarding system.
 *
 * @example
 * ```tsx
 * <Onboarding.Provider config={{
 *   persistKey: "app-onboarding-v1",
 *   accentColor: "#3b82f6",
 *   onComplete: () => router.push("/dashboard"),
 * }}>
 * ```
 */
export interface OnboardingConfig {
  /**
   * LocalStorage key for persisting completion state.
   * When set, the onboarding won't show again after completion.
   * Useful for "show once" flows. Omit for always-show behavior.
   */
  persistKey?: string;

  /**
   * Accent color for progress bar, active dots, and CTA buttons.
   * Accepts any CSS color value.
   * @default "var(--color-accent)"
   */
  accentColor?: string;

  /**
   * Logo element rendered in the header area.
   */
  logo?: ReactNode;

  /**
   * Text for the final step CTA button.
   * @default "Let's Get Started!"
   */
  completeLabel?: string;

  /**
   * Text for the skip/cancel button.
   * @default "Skip"
   */
  skipLabel?: string;

  /**
   * Text for the next button.
   * @default "Next"
   */
  nextLabel?: string;

  /**
   * Text for the back button.
   * @default "Back"
   */
  backLabel?: string;

  /**
   * Whether the onboarding can be dismissed/skipped entirely.
   * If false, the skip button is hidden and backdrop click is disabled.
   * @default true
   */
  dismissible?: boolean;

  /**
   * Called when the user completes all steps (clicks the final CTA).
   */
  onComplete?: () => void;

  /**
   * Called when the user skips/dismisses the onboarding.
   */
  onSkip?: () => void;

  /**
   * Called when the step changes. Useful for analytics.
   */
  onStepChange?: (stepIndex: number, stepId: string) => void;

  /**
   * Whether to show the onboarding in full-screen mode.
   * - `true` — covers the entire viewport (default, PWA-ready)
   * - `false` — centered modal card
   * @default true
   */
  fullScreen?: boolean;
}

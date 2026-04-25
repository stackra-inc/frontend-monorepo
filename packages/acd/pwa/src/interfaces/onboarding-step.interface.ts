/**
 * @fileoverview OnboardingStep interface — configuration for a single onboarding step.
 *
 * Defines the shape of each step in the onboarding flow.
 * Steps can be illustration-based (title + image + description)
 * or custom content (form, settings, preferences).
 *
 * @module onboarding/interfaces/onboarding-step
 */

import type { ReactNode } from 'react';

/**
 * Configuration for a single onboarding step.
 *
 * @example
 * ```tsx
 * const step: OnboardingStepConfig = {
 *   id: "welcome",
 *   title: "Welcome to MNGO",
 *   description: "Your all-in-one POS system",
 *   illustration: <img src="/welcome.png" />,
 * };
 * ```
 */
export interface OnboardingStepConfig {
  /**
   * Unique identifier for this step.
   * Used for analytics tracking and storage persistence.
   */
  id: string;

  /** Step title text. */
  title: string;

  /** Optional description text below the title. */
  description?: string;

  /**
   * Illustration element (image, SVG, icon, or React node).
   * Rendered in the illustration card area.
   * If not provided, the step is treated as a custom content step.
   */
  illustration?: ReactNode;

  /**
   * Custom content for non-illustration steps (forms, settings, preferences).
   * When provided, replaces the illustration + description layout.
   */
  content?: ReactNode;

  /**
   * Whether this step can be skipped.
   * If true, a "Skip" link appears in the footer.
   * @default true
   */
  skippable?: boolean;

  /**
   * Custom validation function called before advancing to the next step.
   * Return `true` to allow, `false` to block.
   * Useful for form validation on settings steps.
   */
  validate?: () => boolean | Promise<boolean>;

  /**
   * Optional metadata for analytics or custom behavior.
   */
  metadata?: Record<string, unknown>;
}

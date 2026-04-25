/**
 * @fileoverview OnboardingContext interface — context value shape.
 *
 * Exposes the current state and navigation operations
 * to all onboarding sub-components via React context.
 *
 * @module pwa/interfaces/onboarding-context
 */

import type { OnboardingStepConfig } from './onboarding-step.interface';
import type { OnboardingConfig } from './onboarding-config.interface';

/**
 * Context value for the onboarding system.
 *
 * Consumed by all `Onboarding.*` sub-components.
 */
export interface OnboardingContextValue {
  /** All registered steps. */
  steps: OnboardingStepConfig[];

  /** Current step index (0-based). */
  current: number;

  /** Total number of steps. */
  total: number;

  /** Whether the current step is the first. */
  isFirst: boolean;

  /** Whether the current step is the last. */
  isLast: boolean;

  /** Progress percentage (0–100). */
  progress: number;

  /** The current step config. */
  currentStep: OnboardingStepConfig;

  /** Animation direction for transitions. */
  direction: 'forward' | 'back';

  /** Top-level config. */
  config: OnboardingConfig;

  /** Navigate to the next step. On last step, triggers onComplete. */
  next: () => void;

  /** Navigate to the previous step. No-op on first step. */
  back: () => void;

  /** Jump to a specific step by index. */
  goTo: (index: number) => void;

  /** Skip/dismiss the entire onboarding. */
  skip: () => void;

  /** Complete the onboarding (called on last step CTA). */
  complete: () => void;
}

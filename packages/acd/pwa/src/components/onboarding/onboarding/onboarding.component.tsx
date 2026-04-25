/**
 * @fileoverview Onboarding — composite namespace for all onboarding sub-components.
 *
 * Usage:
 * ```tsx
 * <Onboarding.Provider open={show} steps={steps} config={{ persistKey: "v1" }}>
 *   <Onboarding.Overlay>
 *     <Onboarding.Progress />
 *     <Onboarding.Header />
 *     <Onboarding.Content />
 *     <Onboarding.Footer />
 *   </Onboarding.Overlay>
 * </Onboarding.Provider>
 * ```
 *
 * @module pwa/components/onboarding
 */

import { OnboardingOverlay } from '@/components/onboarding/onboarding-overlay';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingContent } from '@/components/onboarding/onboarding-content';
import { OnboardingDots } from '@/components/onboarding/onboarding-dots';
import { OnboardingFooter } from '@/components/onboarding/onboarding-footer';
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider';

/**
 * Composite Onboarding namespace — access all sub-components via dot notation.
 */
export const Onboarding = {
  Provider: OnboardingProvider,
  Overlay: OnboardingOverlay,
  Progress: OnboardingProgress,
  Header: OnboardingHeader,
  Content: OnboardingContent,
  Dots: OnboardingDots,
  Footer: OnboardingFooter,
} as const;

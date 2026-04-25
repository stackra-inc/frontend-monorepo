/**
 * @fileoverview useOnboarding — consumer hook for the onboarding context.
 *
 * @module pwa/hooks/use-onboarding
 */

import { useContext } from 'react';
import { OnboardingContext } from '@/contexts';
import type { OnboardingContextValue } from '@/interfaces';

/**
 * Read the onboarding context.
 *
 * @throws {Error} When called outside an `<Onboarding.Provider>`.
 *
 * @example
 * ```tsx
 * function MyStep() {
 *   const { next, back, current, isLast } = useOnboarding();
 *   return <button onClick={next}>{isLast ? "Finish" : "Next"}</button>;
 * }
 * ```
 */
export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('[Onboarding] useOnboarding must be used within an <Onboarding.Provider>.');
  }
  return ctx;
}

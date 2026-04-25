/**
 * @fileoverview OnboardingContext — React context for the onboarding system.
 *
 * @module onboarding/contexts/onboarding
 */

import { createContext } from 'react';
import type { OnboardingContextValue } from '@/interfaces';

/**
 * React context for the onboarding system.
 * `null` when no OnboardingProvider is present.
 */
export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

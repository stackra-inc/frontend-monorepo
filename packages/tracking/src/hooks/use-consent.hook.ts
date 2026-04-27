/**
 * @fileoverview useConsent hook — read and update consent state from React components.
 *
 * Subscribes to {@link ConsentService} changes and triggers re-renders
 * when consent state changes. Provides methods to grant, revoke, and
 * bulk-update consent categories.
 *
 * @module @stackra/react-tracking
 * @category Hooks
 */

import { useState, useEffect, useCallback } from "react";

import type { ConsentCategory } from "@/enums/consent-category.enum";
import type { ConsentState } from "@/interfaces/consent-state.interface";
import type { ConsentService } from "@/services/consent.service";

/**
 * Return type for the `useConsent` hook.
 */
export interface UseConsentReturn {
  /**
   * The current consent state mapping.
   */
  consentState: ConsentState;

  /**
   * Grant consent for a specific category.
   *
   * @param category - The consent category to grant.
   */
  grantConsent: (category: ConsentCategory) => void;

  /**
   * Revoke consent for a specific category.
   *
   * @param category - The consent category to revoke.
   */
  revokeConsent: (category: ConsentCategory) => void;

  /**
   * Replace the entire consent state at once.
   *
   * @param state - The new consent state mapping.
   */
  updateConsent: (state: ConsentState) => void;
}

/**
 * Read and update consent state from React components.
 *
 * Subscribes to the {@link ConsentService} and triggers re-renders when
 * consent state changes. The consent service is resolved from the DI
 * container via the tracking context.
 *
 * @param consentService - The consent service instance resolved from DI.
 * @returns The current consent state and methods to update it.
 *
 * @example
 * ```tsx
 * function CookieBanner() {
 *   const { consentState, grantConsent, revokeConsent } = useConsent(consentSvc);
 *
 *   return (
 *     <div>
 *       <p>Marketing: {consentState.marketing ? 'Granted' : 'Denied'}</p>
 *       <button onPress={() => grantConsent(ConsentCategory.MARKETING)}>
 *         Accept Marketing
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useConsent(consentService: ConsentService): UseConsentReturn {
  const [consentState, setConsentState] = useState<ConsentState>(() => consentService.getState());

  useEffect(() => {
    // Sync state on mount in case it changed between render and effect
    setConsentState(consentService.getState());

    const unsubscribe = consentService.subscribe(() => {
      setConsentState(consentService.getState());
    });

    return unsubscribe;
  }, [consentService]);

  const grantConsent = useCallback(
    (category: ConsentCategory) => {
      consentService.grantConsent(category);
    },
    [consentService],
  );

  const revokeConsent = useCallback(
    (category: ConsentCategory) => {
      consentService.revokeConsent(category);
    },
    [consentService],
  );

  const updateConsent = useCallback(
    (state: ConsentState) => {
      consentService.updateConsent(state);
    },
    [consentService],
  );

  return {
    consentState,
    grantConsent,
    revokeConsent,
    updateConsent,
  };
}

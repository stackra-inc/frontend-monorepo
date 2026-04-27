/**
 * @fileoverview ConsentGate — conditionally renders children based on consent state.
 *
 * Renders its children only when the specified consent category has been
 * granted. Optionally renders a fallback when consent is denied. Subscribes
 * to {@link ConsentService} changes and re-renders automatically.
 *
 * @module @stackra/react-tracking
 * @category Components
 */

import React from "react";

import { useConsent } from "@/hooks/use-consent.hook";
import type { ConsentCategory } from "@/enums/consent-category.enum";
import type { ConsentService } from "@/services/consent.service";

/**
 * Props for the {@link ConsentGate} component.
 */
export interface ConsentGateProps {
  /**
   * The consent category that must be granted for children to render.
   */
  category: ConsentCategory;

  /**
   * The consent service instance resolved from the DI container.
   */
  consentService: ConsentService;

  /**
   * Content to render when consent is granted.
   */
  children: React.ReactNode;

  /**
   * Optional content to render when consent is denied.
   *
   * @default null
   */
  fallback?: React.ReactNode;
}

/**
 * ConsentGate — renders children only when a consent category is granted.
 *
 * Subscribes to the {@link ConsentService} and re-renders when consent
 * state changes. Use this to conditionally render tracking-dependent UI
 * (e.g., pixel-powered widgets, analytics dashboards) based on user consent.
 *
 * @param props - Component props.
 * @returns The children when consent is granted, the fallback otherwise.
 *
 * @example
 * ```tsx
 * <ConsentGate
 *   category={ConsentCategory.MARKETING}
 *   consentService={consentSvc}
 *   fallback={<p>Marketing cookies are disabled.</p>}
 * >
 *   <PersonalizedRecommendations />
 * </ConsentGate>
 * ```
 */
export function ConsentGate({
  category,
  consentService,
  children,
  fallback = null,
}: ConsentGateProps): React.JSX.Element {
  const { consentState } = useConsent(consentService);

  if (consentState[category]) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

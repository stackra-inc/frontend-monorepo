/**
 * @fileoverview OnboardingHeader — Skip link in top-right corner.
 *
 * @module pwa/components/onboarding/onboarding-header
 */

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ONBOARDING_DEFAULTS } from '@/constants';

export interface OnboardingHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function OnboardingHeader({
  className,
  children,
}: OnboardingHeaderProps): React.JSX.Element {
  const { config, skip, isFirst } = useOnboarding();
  const dismissible = config.dismissible ?? ONBOARDING_DEFAULTS.DISMISSIBLE;
  const skipLabel = config.skipLabel ?? ONBOARDING_DEFAULTS.SKIP_LABEL;

  return (
    <div
      className={`px-6 md:px-10 pt-4 pb-0 flex items-center justify-between shrink-0 ${className ?? ''}`}
    >
      <div>{config.logo ?? children}</div>
      {dismissible && isFirst && (
        <button
          onClick={skip}
          className="text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

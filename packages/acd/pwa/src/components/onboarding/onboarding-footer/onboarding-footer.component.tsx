/**
 * @fileoverview OnboardingFooter — dots + navigation buttons.
 * @module pwa/components/onboarding/onboarding-footer
 */

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ONBOARDING_DEFAULTS } from '@/constants';
import { OnboardingDots } from '@/components/onboarding/onboarding-dots';

export interface OnboardingFooterProps {
  className?: string;
  children?: React.ReactNode;
}

export function OnboardingFooter({
  className,
  children,
}: OnboardingFooterProps): React.JSX.Element {
  const { next, back, skip, isFirst, isLast, config, currentStep } = useOnboarding();
  const nextLabel = config.nextLabel ?? ONBOARDING_DEFAULTS.NEXT_LABEL;
  const backLabel = config.backLabel ?? ONBOARDING_DEFAULTS.BACK_LABEL;
  const completeLabel = config.completeLabel ?? ONBOARDING_DEFAULTS.COMPLETE_LABEL;
  const dismissible = config.dismissible ?? ONBOARDING_DEFAULTS.DISMISSIBLE;
  const hasCustomContent = !!currentStep.content;

  return (
    <div
      className={`px-6 md:px-10 py-5 flex items-center justify-between shrink-0 ${className ?? ''}`}
    >
      {children ? (
        children
      ) : (
        <>
          <div className="flex items-center">{!hasCustomContent && <OnboardingDots />}</div>
          <div className="flex items-center gap-3 ml-auto">
            {!isFirst && !hasCustomContent && (
              <button onClick={back} className="button button--ghost button--md">
                {backLabel}
              </button>
            )}
            {hasCustomContent && (
              <button onClick={skip} className="button button--ghost button--md">
                Cancel
              </button>
            )}
            {isFirst && !hasCustomContent && dismissible && (
              <button onClick={skip} className="button button--ghost button--md">
                {config.skipLabel ?? ONBOARDING_DEFAULTS.SKIP_LABEL}
              </button>
            )}
            <button onClick={next} className="button button--primary button--md">
              {isLast || hasCustomContent ? completeLabel : nextLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

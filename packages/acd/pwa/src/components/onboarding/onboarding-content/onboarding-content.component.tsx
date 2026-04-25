/**
 * @fileoverview OnboardingContent — step content area.
 *
 * @module pwa/components/onboarding/onboarding-content
 */

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';

export interface OnboardingContentProps {
  className?: string;
}

export function OnboardingContent({ className }: OnboardingContentProps): React.JSX.Element {
  const { currentStep, current, direction } = useOnboarding();
  const hasCustomContent = !!currentStep.content;

  const animClass =
    direction === 'forward'
      ? 'animate-in slide-in-from-right-4 duration-300'
      : 'animate-in slide-in-from-left-4 duration-300';

  return (
    <div className={`flex-1 overflow-y-auto ${className ?? ''}`}>
      <div key={current} className={animClass}>
        {hasCustomContent ? (
          <div className="max-w-lg mx-auto px-6 md:px-10 pt-10 pb-8">
            <h2 className="text-xl font-bold text-foreground mb-2">{currentStep.title}</h2>
            {currentStep.description && (
              <p className="text-sm text-muted mb-8 leading-relaxed">{currentStep.description}</p>
            )}
            {currentStep.content}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center text-center px-6 md:px-10 min-h-full"
            style={{
              paddingTop: 'max(10vh, 40px)',
              paddingBottom: 'max(6vh, 24px)',
            }}
          >
            {currentStep.illustration && (
              <div className="w-full max-w-xs mb-8 rounded-2xl overflow-hidden bg-surface border border-separator p-8">
                {currentStep.illustration}
              </div>
            )}
            <h2 className="text-2xl font-bold text-foreground mb-3">{currentStep.title}</h2>
            {currentStep.description && (
              <p className="text-sm text-muted leading-relaxed max-w-sm">
                {currentStep.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

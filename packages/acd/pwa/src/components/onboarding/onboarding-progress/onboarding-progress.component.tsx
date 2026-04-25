/**
 * @fileoverview OnboardingProgress — dark top bar + progress bar.
 * @module pwa/components/onboarding/onboarding-progress
 */

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';

export interface OnboardingProgressProps {
  className?: string;
}

export function OnboardingProgress({ className }: OnboardingProgressProps): React.JSX.Element {
  const { progress } = useOnboarding();

  return (
    <div className={`shrink-0 ${className ?? ''}`}>
      {/* Dark top bar */}
      <div className="h-3 bg-foreground" />
      {/* Progress track */}
      <div className="h-1.5 bg-muted/10">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

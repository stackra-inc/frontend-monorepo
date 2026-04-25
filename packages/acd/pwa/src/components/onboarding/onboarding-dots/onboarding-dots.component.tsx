/**
 * @fileoverview OnboardingDots — step position indicators.
 *
 * @module pwa/components/onboarding/onboarding-dots
 */

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ONBOARDING_DEFAULTS } from '@/constants';

export interface OnboardingDotsProps {
  className?: string;
}

export function OnboardingDots({ className }: OnboardingDotsProps): React.JSX.Element {
  const { current, total, config } = useOnboarding();
  const accent = config.accentColor ?? ONBOARDING_DEFAULTS.ACCENT_COLOR;

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i <= current ? accent : undefined,
            opacity: i === current ? 1 : i < current ? 0.5 : 0.2,
          }}
        >
          {i > current && <div className="w-full h-full rounded-full bg-muted" />}
        </div>
      ))}
    </div>
  );
}

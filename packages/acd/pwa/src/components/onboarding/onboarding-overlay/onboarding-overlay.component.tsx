/**
 * @fileoverview OnboardingOverlay — full-screen container matching Figma design.
 *
 * @module pwa/components/onboarding/onboarding-overlay
 */

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ONBOARDING_DEFAULTS } from '@/constants';

export interface OnboardingOverlayProps {
  children: React.ReactNode;
  className?: string;
}

export function OnboardingOverlay({
  children,
  className,
}: OnboardingOverlayProps): React.JSX.Element | null {
  const { config } = useOnboarding();

  if ((config as Record<string, unknown>)._visible === false) return null;

  const fullScreen = config.fullScreen ?? ONBOARDING_DEFAULTS.FULL_SCREEN;

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-[100] flex flex-col bg-background ${className ?? ''}`}>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-2xl mx-4 bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${className ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}

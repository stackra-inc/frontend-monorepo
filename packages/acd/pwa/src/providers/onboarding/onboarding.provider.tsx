/**
 * @fileoverview OnboardingProvider — state management for the onboarding flow.
 *
 * Manages step navigation, validation, persistence, and exposes
 * the onboarding context to all sub-components.
 *
 * @module pwa/providers/onboarding
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { OnboardingContext } from '@/contexts';
import type { OnboardingStepConfig, OnboardingConfig, OnboardingContextValue } from '@/interfaces';
import { isOnboardingCompleted, markOnboardingCompleted } from '@/utils';
import { usePwaConfig } from '@/hooks/use-pwa-config';

export interface OnboardingProviderProps {
  /** Whether the onboarding overlay is visible. */
  open: boolean;
  /** Onboarding configuration override — if not provided, reads from DI (PWA_CONFIG). */
  config?: OnboardingConfig;
  /** Step configurations override — if not provided, reads from DI config. */
  steps?: OnboardingStepConfig[];
  /** Children (Onboarding.Overlay and sub-components). */
  children: ReactNode;
}

/**
 * Provides onboarding state and navigation to all sub-components.
 *
 * @example
 * ```tsx
 * <Onboarding.Provider open={show} steps={steps} config={{ persistKey: "v1" }}>
 *   <Onboarding.Overlay>
 *     <Onboarding.Progress />
 *     <Onboarding.Header />
 *     <Onboarding.Content />
 *     <Onboarding.Footer />
 *   </Onboarding.Overlay>
 * </Onboarding.Provider>
 * ```
 */
export function OnboardingProvider({
  open,
  config: propConfig,
  steps: propSteps,
  children,
}: OnboardingProviderProps): React.JSX.Element {
  /*
  |--------------------------------------------------------------------------
  | Resolve config: props override > DI container > empty defaults
  |--------------------------------------------------------------------------
  */
  const diConfig = usePwaConfig();
  const config: OnboardingConfig = propConfig ?? diConfig?.onboarding ?? {};
  const steps: OnboardingStepConfig[] = propSteps ?? diConfig?.onboarding?.steps ?? [];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const total = steps.length;
  const isFirst = current === 0;
  const isLast = current === total - 1;
  const currentStep = steps[current] ?? steps[0]!;
  const progress = total > 1 ? ((current + 1) / total) * 100 : 100;

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrent(0);
      setDirection('forward');
    }
  }, [open]);

  // Check persistence
  const shouldShow = useMemo(() => {
    if (!open) return false;
    if (config.persistKey && isOnboardingCompleted(config.persistKey)) return false;
    return true;
  }, [open, config.persistKey]);

  const next = useCallback(async () => {
    if (currentStep.validate) {
      const valid = await currentStep.validate();
      if (!valid) return;
    }
    if (isLast) {
      if (config.persistKey) markOnboardingCompleted(config.persistKey);
      config.onComplete?.();
      return;
    }
    setDirection('forward');
    const nextIdx = Math.min(current + 1, total - 1);
    setCurrent(nextIdx);
    config.onStepChange?.(nextIdx, steps[nextIdx]!.id);
  }, [current, isLast, total, currentStep, config, steps]);

  const back = useCallback(() => {
    if (isFirst) return;
    setDirection('back');
    const prevIdx = Math.max(current - 1, 0);
    setCurrent(prevIdx);
    config.onStepChange?.(prevIdx, steps[prevIdx]!.id);
  }, [current, isFirst, config, steps]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      setDirection(index > current ? 'forward' : 'back');
      setCurrent(index);
      config.onStepChange?.(index, steps[index]!.id);
    },
    [current, total, config, steps]
  );

  const skip = useCallback(() => {
    config.onSkip?.();
  }, [config]);

  const complete = useCallback(() => {
    if (config.persistKey) markOnboardingCompleted(config.persistKey);
    config.onComplete?.();
  }, [config]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      steps,
      current,
      total,
      isFirst,
      isLast,
      progress,
      currentStep,
      direction,
      config,
      next,
      back,
      goTo,
      skip,
      complete,
    }),
    [
      steps,
      current,
      total,
      isFirst,
      isLast,
      progress,
      currentStep,
      direction,
      config,
      next,
      back,
      goTo,
      skip,
      complete,
    ]
  );

  if (!shouldShow || total === 0) {
    return <>{children}</>;
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

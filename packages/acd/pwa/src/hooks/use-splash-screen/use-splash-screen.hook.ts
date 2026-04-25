/**
 * @fileoverview useSplashScreen — hook that manages splash screen visibility.
 *
 * Ensures the splash screen is shown for at least `minDuration` ms,
 * then fades out. Call `ready()` when the app has finished loading.
 *
 * @module pwa/hooks/use-splash-screen
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SPLASH_DEFAULTS } from '@/constants';

/**
 * Manage splash screen visibility.
 *
 * @param minDuration - Minimum display time in ms.
 * @returns `{ isVisible, ready, progress, setProgress }`
 */
export function useSplashScreen(minDuration = SPLASH_DEFAULTS.MIN_DURATION) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const appReady = useRef(false);
  const startTime = useRef(Date.now());

  const ready = useCallback(() => {
    appReady.current = true;
    const elapsed = Date.now() - startTime.current;
    const remaining = Math.max(0, minDuration - elapsed);
    setTimeout(() => setIsVisible(false), remaining);
  }, [minDuration]);

  // Auto-dismiss after minDuration if ready() was never called
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!appReady.current) {
        setIsVisible(false);
      }
    }, minDuration + 5000); // 5s grace period
    return () => clearTimeout(timer);
  }, [minDuration]);

  return { isVisible, ready, progress, setProgress };
}

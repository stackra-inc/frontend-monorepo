/**
 * @fileoverview useStandaloneMode — detects if the app is running in standalone PWA mode.
 *
 * Checks `display-mode: standalone` media query and iOS `navigator.standalone`.
 *
 * @module pwa/app-shell/hooks/use-standalone-mode
 */

import { useState, useEffect } from 'react';

/**
 * Detect whether the app is running as an installed PWA (standalone mode).
 *
 * @returns `true` if running in standalone/fullscreen mode.
 */
export function useStandaloneMode(): boolean {
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (navigator as any).standalone === true
    );
  });

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isStandalone;
}

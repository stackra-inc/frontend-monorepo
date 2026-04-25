/**
 * @fileoverview SplashScreen — full-screen branded loading screen.
 *
 * Uses HeroUI Spinner and ProgressBar for loading indicators.
 * Displays a centered logo, app name, optional spinner/progress bar,
 * and fades out when the app signals readiness.
 *
 * @module pwa/components/splash-screen
 */

import React from 'react';
import { Spinner, ProgressBar } from '@heroui/react';
import { SPLASH_DEFAULTS } from '@/constants';
import type { SplashScreenConfig } from '@/interfaces';

/** Props for the SplashScreen component. */
export interface SplashScreenProps extends SplashScreenConfig {
  /** Whether the splash screen is visible. Controlled by `useSplashScreen`. */
  isVisible: boolean;
  /** Loading progress 0–100. Only shown when `showProgress` is true. */
  progress?: number;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Full-screen branded loading screen for PWA initialization.
 *
 * @example
 * ```tsx
 * const { isVisible, ready } = useSplashScreen();
 *
 * useEffect(() => { loadData().then(ready); }, []);
 *
 * <SplashScreen
 *   isVisible={isVisible}
 *   logo={<AppLogo />}
 *   appName="MNGO POS"
 *   tagline="Loading..."
 * />
 * ```
 */
export function SplashScreen({
  isVisible,
  logo,
  appName,
  tagline,
  showSpinner = SPLASH_DEFAULTS.SHOW_SPINNER,
  showProgress = SPLASH_DEFAULTS.SHOW_PROGRESS,
  progress = 0,
  background = SPLASH_DEFAULTS.BACKGROUND,
  className,
}: SplashScreenProps): React.JSX.Element | null {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 transition-opacity duration-300 ${background} ${className ?? ''}`}
      role="status"
      aria-label="Loading"
    >
      {logo && <div className="animate-pulse">{logo}</div>}
      {appName && <h1 className="text-2xl font-bold text-foreground">{appName}</h1>}
      {tagline && <p className="text-sm text-muted">{tagline}</p>}
      {showSpinner && <Spinner size="lg" color="accent" />}
      {showProgress && (
        <div className="w-48">
          <ProgressBar
            aria-label="Loading progress"
            value={Math.min(100, Math.max(0, progress))}
            color="accent"
            size="sm"
          />
        </div>
      )}
    </div>
  );
}

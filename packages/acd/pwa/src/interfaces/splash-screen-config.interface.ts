/**
 * @fileoverview SplashScreenConfig — configuration for the splash screen.
 * @module pwa/splash-screen/interfaces/splash-screen-config
 */

import type { ReactNode } from 'react';

/**
 * Configuration for the PWA splash screen.
 */
export interface SplashScreenConfig {
  /** Minimum display duration in ms before auto-dismiss. @default 1500 */
  minDuration?: number;

  /** Custom logo/icon element. */
  logo?: ReactNode;

  /** App name displayed below the logo. */
  appName?: string;

  /** Tagline or loading message. */
  tagline?: string;

  /** Whether to show a spinner. @default true */
  showSpinner?: boolean;

  /** Whether to show a progress bar. @default false */
  showProgress?: boolean;

  /** Background CSS class or color. @default "bg-background" */
  background?: string;
}

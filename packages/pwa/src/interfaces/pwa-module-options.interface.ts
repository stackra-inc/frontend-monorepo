/**
 * @fileoverview PwaModuleOptions — unified configuration for the entire PWA package.
 *
 * |--------------------------------------------------------------------------
 * | Combines vite-plugin-pwa options, component configs, and runtime
 * | settings into a single typed configuration object.
 * |--------------------------------------------------------------------------
 * |
 * | Used by:
 * |   - `defineConfig()` helper in the app's config file
 * |   - `vitePwaPlugin()` for build-time service worker generation
 * |   - `<PwaProvider>` for runtime component configuration
 * |
 * @module pwa/interfaces/pwa-module-options
 */

import type { VitePwaPluginOptions } from './vite-pwa-plugin-options.interface';
import type { InstallPromptConfig } from './install-prompt-config.interface';
import type { UpdatePromptConfig } from './update-prompt-config.interface';
import type { AppShellConfig } from './app-shell-config.interface';
import type { SplashScreenConfig } from './splash-screen-config.interface';
import type { PullToRefreshConfig } from './pull-to-refresh-config.interface';
import type { OnboardingConfig } from './onboarding-config.interface';
import type { OnboardingStepConfig } from './onboarding-step.interface';

/**
 * Offline indicator configuration.
 */
export interface OfflineIndicatorConfig {
  /** Whether to show the offline indicator. @default true */
  enabled?: boolean;
  /** Position of the indicator. @default "bottom" */
  position?: 'top' | 'bottom';
  /** Custom message when offline. @default "You are offline" */
  message?: string;
  /** Custom message when back online. @default "Back online" */
  onlineMessage?: string;
  /** Duration in ms to show the "back online" message. @default 3000 */
  onlineDuration?: number;
}

/**
 * Unified configuration for the entire @stackra-inc/ts-pwa package.
 *
 * Split into two sections:
 *   - `vite` — build-time options for vite-plugin-pwa (manifest, workbox, SW)
 *   - everything else — runtime options for React components
 *
 * @example
 * ```ts
 * import { defineConfig } from "@stackra-inc/ts-pwa";
 *
 * export default defineConfig({
 *   vite: {
 *     registerType: "autoUpdate",
 *     manifest: {
 *       name: "Stackra POS",
 *       short_name: "POS",
 *       theme_color: "#000000",
 *       background_color: "#000000",
 *     },
 *     workbox: {
 *       globPatterns: ["**\/*.{js,css,html,ico,png,svg,woff2}"],
 *     },
 *   },
 *   install: {
 *     delay: 30000,
 *     maxDismissals: 3,
 *     title: "Install Stackra",
 *     description: "Add to your home screen for the best experience.",
 *   },
 *   update: {
 *     pollingInterval: 60000,
 *     title: "Update Available",
 *   },
 *   splash: {
 *     appName: "Stackra",
 *     minDuration: 2000,
 *     showSpinner: true,
 *   },
 *   appShell: {
 *     statusBarStyle: "black-translucent",
 *     safeAreaPadding: true,
 *     preventOverscroll: true,
 *   },
 *   offline: {
 *     enabled: true,
 *     position: "bottom",
 *   },
 *   pullToRefresh: {
 *     threshold: 80,
 *     enabled: true,
 *   },
 *   onboarding: {
 *     persistKey: "pos-onboarding-v1",
 *     dismissible: true,
 *     fullScreen: true,
 *     steps: [],
 *   },
 * });
 * ```
 */
export interface PwaModuleOptions {
  /*
  |--------------------------------------------------------------------------
  | Build-Time: Vite Plugin Options
  |--------------------------------------------------------------------------
  |
  | Passed to vite-plugin-pwa at build time.
  | Controls manifest generation, service worker, workbox caching.
  |
  */

  /** Vite plugin options for service worker and manifest generation. */
  vite?: VitePwaPluginOptions;

  /*
  |--------------------------------------------------------------------------
  | Runtime: Install Prompt
  |--------------------------------------------------------------------------
  |
  | Controls the "Add to Home Screen" prompt behavior.
  |
  */

  /** Install prompt configuration. */
  install?: InstallPromptConfig;

  /*
  |--------------------------------------------------------------------------
  | Runtime: Update Prompt
  |--------------------------------------------------------------------------
  |
  | Controls the service worker update notification.
  |
  */

  /** Update prompt configuration. */
  update?: UpdatePromptConfig;

  /*
  |--------------------------------------------------------------------------
  | Runtime: Splash Screen
  |--------------------------------------------------------------------------
  |
  | Controls the app splash/loading screen.
  |
  */

  /** Splash screen configuration. */
  splash?: SplashScreenConfig;

  /*
  |--------------------------------------------------------------------------
  | Runtime: App Shell
  |--------------------------------------------------------------------------
  |
  | Controls the PWA app shell layout (status bar, safe area, overscroll).
  |
  */

  /** App shell layout configuration. */
  appShell?: AppShellConfig;

  /*
  |--------------------------------------------------------------------------
  | Runtime: Offline Indicator
  |--------------------------------------------------------------------------
  |
  | Controls the offline/online status indicator.
  |
  */

  /** Offline indicator configuration. */
  offline?: OfflineIndicatorConfig;

  /*
  |--------------------------------------------------------------------------
  | Runtime: Pull to Refresh
  |--------------------------------------------------------------------------
  |
  | Controls the pull-to-refresh gesture.
  | Note: `onRefresh` callback must be set at runtime, not in config.
  |
  */

  /** Pull-to-refresh configuration (without onRefresh — set at runtime). */
  pullToRefresh?: Omit<PullToRefreshConfig, 'onRefresh'>;

  /*
  |--------------------------------------------------------------------------
  | Runtime: Onboarding
  |--------------------------------------------------------------------------
  |
  | Controls the first-run onboarding flow.
  |
  */

  /** Onboarding configuration. */
  onboarding?: OnboardingConfig & {
    /** Onboarding steps. */
    steps?: OnboardingStepConfig[];
  };
}

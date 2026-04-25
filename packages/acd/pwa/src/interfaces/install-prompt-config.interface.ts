/**
 * @fileoverview InstallPromptConfig — configuration for the install prompt.
 *
 * Controls when and how the "Add to Home Screen" prompt appears.
 *
 * @module pwa/install-prompt/interfaces/install-prompt-config
 */

import type { ReactNode } from 'react';

/**
 * Configuration for the PWA install prompt.
 *
 * @example
 * ```tsx
 * <InstallPrompt.Provider config={{
 *   delay: 30000,
 *   dismissKey: "pwa-install-dismissed",
 *   maxDismissals: 3,
 * }}>
 *   <InstallPrompt.Banner />
 * </InstallPrompt.Provider>
 * ```
 */
export interface InstallPromptConfig {
  /**
   * Delay in ms before showing the prompt after the `beforeinstallprompt` event fires.
   * Gives the user time to explore the app before being prompted.
   *
   * @default 0
   */
  delay?: number;

  /**
   * localStorage key used to track dismissal count.
   * Set to `false` to disable persistence (always show).
   *
   * @default "pwa-install-dismissed"
   */
  dismissKey?: string | false;

  /**
   * Maximum number of times the user can dismiss before the prompt stops appearing.
   * Set to `Infinity` to always re-show.
   *
   * @default 3
   */
  maxDismissals?: number;

  /**
   * Custom title for the install banner/modal.
   *
   * @default "Install App"
   */
  title?: string;

  /**
   * Custom description text.
   *
   * @default "Add this app to your home screen for a better experience."
   */
  description?: string;

  /**
   * Custom icon rendered in the banner. Defaults to a download icon.
   */
  icon?: ReactNode;

  /**
   * Label for the install button.
   *
   * @default "Install"
   */
  installLabel?: string;

  /**
   * Label for the dismiss button.
   *
   * @default "Not now"
   */
  dismissLabel?: string;
}

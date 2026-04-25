/**
 * @fileoverview PwaContextValue — unified context shape for all PWA features.
 *
 * Combines install prompt, update prompt, network status, and standalone
 * detection into a single context consumed via `usePwa()`.
 *
 * @module pwa/interfaces/pwa-context-value
 */

import type { NetworkStatus } from './network-status.interface';

/**
 * Unified PWA context value.
 *
 * Provides access to all PWA feature states and actions
 * through a single `usePwa()` hook.
 */
export interface PwaContextValue {
  // ── Install Prompt ──

  /** Whether the browser supports the install prompt (beforeinstallprompt fired). */
  install: {
    isSupported: boolean;
    isVisible: boolean;
    isInstalled: boolean;
    dismissCount: number;
    prompt: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
    dismiss: () => void;
  };

  // ── Update Prompt ──

  /** Service worker update detection and actions. */
  update: {
    isAvailable: boolean;
    isVisible: boolean;
    apply: () => void;
    dismiss: () => void;
  };

  // ── Network Status ──

  /** Current network connectivity state. */
  network: NetworkStatus;

  // ── Standalone Mode ──

  /** Whether the app is running as an installed PWA. */
  isStandalone: boolean;
}

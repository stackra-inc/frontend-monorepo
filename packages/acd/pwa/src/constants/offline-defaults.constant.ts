/**
 * @fileoverview Default configuration values for the offline indicator.
 * @module pwa/offline-indicator/constants
 */

export const OFFLINE_DEFAULTS = {
  /** Duration in ms to show the "back online" banner before auto-hiding. */
  RECONNECT_BANNER_MS: 3000,
  /** Offline banner message. */
  OFFLINE_MESSAGE: 'You are offline',
  /** Reconnected banner message. */
  RECONNECT_MESSAGE: 'Back online',
} as const;

/**
 * @fileoverview UpdatePromptConfig — configuration for the service worker update prompt.
 * @module pwa/update-prompt/interfaces/update-prompt-config
 */

import type { ReactNode } from 'react';

/**
 * Configuration for the PWA update prompt.
 */
export interface UpdatePromptConfig {
  /**
   * Polling interval in ms to check for service worker updates.
   * Set to `0` to disable polling (rely on browser default).
   *
   * @default 60000 (1 minute)
   */
  pollingInterval?: number;

  /** Custom title for the update banner. @default "Update Available" */
  title?: string;

  /** Custom description. @default "A new version is available. Refresh to update." */
  description?: string;

  /** Custom icon. */
  icon?: ReactNode;

  /** Label for the update/refresh button. @default "Refresh" */
  updateLabel?: string;

  /** Label for the dismiss button. @default "Later" */
  dismissLabel?: string;
}

/**
 * @fileoverview PwaConfig — unified configuration for the PwaProvider.
 *
 * Combines install prompt, update prompt, and general PWA settings
 * into a single configuration object.
 *
 * @module pwa/interfaces/pwa-config
 */

import type { InstallPromptConfig } from './install-prompt-config.interface';
import type { UpdatePromptConfig } from './update-prompt-config.interface';

/**
 * Unified configuration for the PWA provider.
 *
 * @example
 * ```tsx
 * <PwaProvider config={{
 *   install: { delay: 30000, maxDismissals: 3 },
 *   update: { pollingInterval: 60000 },
 * }}>
 *   <App />
 * </PwaProvider>
 * ```
 */
export interface PwaConfig {
  /** Install prompt configuration. */
  install?: InstallPromptConfig;

  /** Update prompt configuration. */
  update?: UpdatePromptConfig;
}

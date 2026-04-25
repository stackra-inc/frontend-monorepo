/**
 * @fileoverview UpdatePromptContextValue — shape of the update prompt context.
 * @module pwa/update-prompt/interfaces/update-prompt-context-value
 */

/**
 * Context value exposed by the `UpdatePromptProvider`.
 */
export interface UpdatePromptContextValue {
  /** Whether a new service worker is waiting to activate. */
  isUpdateAvailable: boolean;

  /** Whether the update prompt banner is visible. */
  isVisible: boolean;

  /** Activate the waiting service worker and reload the page. */
  applyUpdate: () => void;

  /** Dismiss the update banner. */
  dismiss: () => void;

  /** The waiting ServiceWorker registration, if any. */
  registration: ServiceWorkerRegistration | null;
}

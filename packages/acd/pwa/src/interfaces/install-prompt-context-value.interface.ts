/**
 * @fileoverview InstallPromptContextValue — shape of the install prompt context.
 * @module pwa/install-prompt/interfaces/install-prompt-context-value
 */

/**
 * Context value exposed by the `InstallPromptProvider`.
 */
export interface InstallPromptContextValue {
  /** Whether the browser supports the install prompt (beforeinstallprompt fired). */
  isSupported: boolean;

  /** Whether the prompt is currently visible to the user. */
  isVisible: boolean;

  /** Whether the app is already installed (standalone mode). */
  isInstalled: boolean;

  /** Trigger the native install prompt. Resolves to the user's choice. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;

  /** Dismiss the custom banner/modal. Increments the dismissal counter. */
  dismiss: () => void;

  /** Number of times the user has dismissed the prompt. */
  dismissCount: number;
}

/**
 * @fileoverview Default configuration values for the install prompt.
 * @module pwa/install-prompt/constants
 */

export const INSTALL_PROMPT_DEFAULTS = {
  DELAY: 0,
  DISMISS_KEY: 'pwa-install-dismissed',
  MAX_DISMISSALS: 3,
  TITLE: 'Install App',
  DESCRIPTION: 'Add this app to your home screen for a better experience.',
  INSTALL_LABEL: 'Install',
  DISMISS_LABEL: 'Not now',
} as const;

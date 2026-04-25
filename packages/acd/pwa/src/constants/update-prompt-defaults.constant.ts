/**
 * @fileoverview Default configuration values for the update prompt.
 * @module pwa/update-prompt/constants
 */

export const UPDATE_PROMPT_DEFAULTS = {
  POLLING_INTERVAL: 60_000,
  TITLE: 'Update Available',
  DESCRIPTION: 'A new version is available. Refresh to update.',
  UPDATE_LABEL: 'Refresh',
  DISMISS_LABEL: 'Later',
} as const;

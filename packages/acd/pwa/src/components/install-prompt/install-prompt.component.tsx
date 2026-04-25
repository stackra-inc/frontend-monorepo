/**
 * @fileoverview InstallPrompt — composite namespace for install prompt sub-components.
 *
 * Note: The provider is the unified `PwaProvider`, not a per-component one.
 * Use `<PwaProvider>` to wrap your app, then render `<InstallPrompt.Banner />`.
 *
 * @module pwa/components/install-prompt
 */

import { InstallPromptBanner } from '@/components/install-prompt-banner';

/** Composite namespace — access install prompt sub-components via dot notation. */
export const InstallPrompt = {
  /** Fixed-bottom install banner with HeroUI Alert + Button. */
  Banner: InstallPromptBanner,
} as const;

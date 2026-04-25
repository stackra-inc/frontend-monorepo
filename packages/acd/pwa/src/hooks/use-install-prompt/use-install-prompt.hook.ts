/**
 * @fileoverview useInstallPrompt — convenience hook for install prompt state.
 *
 * Thin wrapper around `usePwa().install` for consumers that only
 * need install prompt functionality.
 *
 * @module pwa/hooks/use-install-prompt
 */

import { usePwa } from '@/hooks/use-pwa';

/**
 * Access install prompt state and actions.
 *
 * @returns Install prompt slice from the unified PWA context.
 */
export function useInstallPrompt() {
  return usePwa().install;
}

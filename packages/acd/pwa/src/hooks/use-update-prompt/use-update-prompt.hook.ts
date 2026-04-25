/**
 * @fileoverview useUpdatePrompt — convenience hook for update prompt state.
 *
 * Thin wrapper around `usePwa().update` for consumers that only
 * need service worker update functionality.
 *
 * @module pwa/hooks/use-update-prompt
 */

import { usePwa } from '@/hooks/use-pwa';

/**
 * Access update prompt state and actions.
 *
 * @returns Update prompt slice from the unified PWA context.
 */
export function useUpdatePrompt() {
  return usePwa().update;
}

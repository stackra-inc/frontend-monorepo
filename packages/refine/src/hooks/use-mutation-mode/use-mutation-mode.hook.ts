/**
 * @fileoverview useMutationMode hook.
 *
 * Returns the configured mutation mode and undoable timeout from
 * the global Refine options. Supports per-call overrides.
 *
 * Mutation modes:
 * - `pessimistic` — mutation executes immediately, UI updates after response.
 * - `optimistic` — UI updates immediately, rolls back on error.
 * - `undoable` — shows a countdown toast; mutation executes after timeout unless cancelled.
 *
 * @module @stackra-inc/react-refine
 * @category Hooks
 */

import { useOptionalInject } from '@stackra-inc/ts-container';
import { REFINE_OPTIONS } from '@/constants';
import type { RefineRootOptions } from '@/types/refine-root-options.type';
import type { MutationMode } from '@/types/mutation-mode.type';

/** Default mutation mode when not configured. */
const DEFAULT_MUTATION_MODE: MutationMode = 'pessimistic';

/** Default undoable timeout in milliseconds. */
const DEFAULT_UNDOABLE_TIMEOUT = 5000;

/**
 * Resolve the active mutation mode and undoable timeout.
 *
 * @param preferredMutationMode - Override the global mutation mode for this call.
 * @param preferredUndoableTimeout - Override the global undoable timeout for this call.
 * @returns The resolved mutation mode and undoable timeout.
 */
export function useMutationMode(
  preferredMutationMode?: MutationMode,
  preferredUndoableTimeout?: number
): {
  mutationMode: MutationMode;
  undoableTimeout: number;
} {
  const options = useOptionalInject<RefineRootOptions>(REFINE_OPTIONS);

  return {
    mutationMode: preferredMutationMode ?? options?.mutationMode ?? DEFAULT_MUTATION_MODE,
    undoableTimeout:
      preferredUndoableTimeout ?? options?.undoableTimeout ?? DEFAULT_UNDOABLE_TIMEOUT,
  };
}

/**
 * @fileoverview MutationMode type.
 * @module @stackra-inc/react-refine
 * @category Types
 */

/**
 * Determines when mutations are executed.
 *
 * - `pessimistic` — mutation executes immediately, UI updates after server response.
 * - `optimistic` — UI updates immediately, rolls back on error.
 * - `undoable` — shows a countdown toast; mutation executes after timeout unless cancelled.
 */
export type MutationMode = 'pessimistic' | 'optimistic' | 'undoable';

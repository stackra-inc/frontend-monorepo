/**
 * @fileoverview OpenNotificationParams interface — parameters for opening a notification.
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Parameters for opening a notification.
 */
export interface OpenNotificationParams {
  /** Notification message text. */
  message: string;

  /**
   * Notification severity / purpose.
   *
   * - `success` / `error` / `info` / `warning` — standard severity levels.
   * - `progress` — used by undoable mutations to show a countdown toast
   *   with an "Undo" action. When `type` is `progress`, the
   *   {@link cancelMutation} and {@link undoableTimeout} fields are
   *   expected to be set.
   */
  type: 'success' | 'error' | 'info' | 'warning' | 'progress';

  /** Optional longer description. */
  description?: string;

  /** Optional unique key for deduplication or closing. */
  key?: string;

  /**
   * Timeout in seconds for undoable (progress) notifications.
   *
   * After this period the mutation executes automatically.
   * Only meaningful when `type` is `progress`.
   */
  undoableTimeout?: number;

  /**
   * Callback to cancel an undoable mutation.
   *
   * Provided by the mutation hooks (useUpdate, useDelete) when
   * `mutationMode` is `"undoable"`. Calling this aborts the
   * pending mutation.
   *
   * Only meaningful when `type` is `progress`.
   */
  cancelMutation?: () => void;
}

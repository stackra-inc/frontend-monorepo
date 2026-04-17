/**
 * @fileoverview OpenNotificationParams interface — parameters for opening a notification.
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

/**
 * Parameters for opening a notification.
 */
export interface OpenNotificationParams {
  /** Notification message text. */
  message: string;

  /** Notification severity level. */
  type: 'success' | 'error' | 'info' | 'warning';

  /** Optional longer description. */
  description?: string;

  /** Optional unique key for deduplication or closing. */
  key?: string;

  /** Optional timeout in ms for undoable notifications. */
  undoableTimeout?: number;
}

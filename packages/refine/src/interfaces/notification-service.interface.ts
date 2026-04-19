/**
 * @fileoverview INotificationService interface — contract for displaying user-facing notifications.
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

import type { OpenNotificationParams } from './open-notification-params.interface';

/**
 * Notification service interface.
 *
 * Implementations display and dismiss user-facing notifications.
 */
export interface INotificationService {
  /**
   * Open/display a notification.
   * @param params - Notification parameters.
   */
  open(params: OpenNotificationParams): void;

  /**
   * Close/dismiss a notification by key.
   * @param key - The notification key to close.
   */
  close(key: string): void;
}

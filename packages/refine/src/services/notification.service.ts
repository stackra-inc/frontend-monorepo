/**
 * @fileoverview HeroUI Toast NotificationService implementation.
 *
 * Integrates with HeroUI's imperative `toast` API to display
 * user-facing notifications. Requires `<Toast.Provider />` to be
 * rendered in the application root.
 *
 * Supports undoable (progress) notifications — when a mutation uses
 * `mutationMode: "undoable"`, a toast with an "Undo" action button
 * is displayed. Pressing "Undo" calls `cancelMutation()` to abort
 * the pending operation.
 *
 * @module @stackra/react-refine
 * @category Services
 *
 * @example
 * ```tsx
 * // 1. Render the provider in your app root:
 * import { Toast } from '@heroui/react';
 *
 * function App() {
 *   return (
 *     <>
 *       <Toast.Provider />
 *       <YourApp />
 *     </>
 *   );
 * }
 *
 * // 2. The service is registered automatically via RefineModule.forRoot().
 * //    Hooks like useNotification() will use HeroUI toasts out of the box.
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { toast } from '@heroui/react';
import type { INotificationService } from '@/interfaces/notification-service.interface';
import type { OpenNotificationParams } from '@/interfaces/open-notification-params.interface';

/**
 * HeroUI Toast notification service.
 *
 * Uses the imperative `toast` / `toast.success` / `toast.danger` /
 * `toast.warning` / `toast.info` API from `@heroui/react`.
 *
 * For undoable mutations (`type: "progress"`), renders a toast with
 * an "Undo" action button via HeroUI's `actionProps`.
 */
@Injectable()
export class NotificationService implements INotificationService {
  /**
   * Map of active notification keys → toast IDs returned by HeroUI,
   * used for programmatic dismissal via {@link close}.
   * @internal
   */
  private activeNotifications = new Map<string, string | number>();

  /**
   * Auto-incrementing counter for generating unique notification
   * keys when the caller does not provide one.
   * @internal
   */
  private keyCounter = 0;

  // ─── INotificationService Implementation ─────────────────────────

  /**
   * Display a notification via HeroUI toast.
   *
   * Maps the notification `type` to the corresponding HeroUI toast
   * variant method. For `progress` (undoable) notifications, shows
   * a warning-style toast with an "Undo" action button.
   *
   * @param params - Notification parameters.
   */
  open(params: OpenNotificationParams): void {
    const { message, type, description, key, undoableTimeout, cancelMutation } = params;
    const notificationKey = key ?? `notification_${++this.keyCounter}`;

    const options: Record<string, unknown> = {};

    if (description) {
      options.description = description;
    }

    let toastId: string | number;

    switch (type) {
      case 'success':
        toastId = toast.success(message, options);
        break;

      case 'error':
        toastId = toast.danger(message, options);
        break;

      case 'warning':
        toastId = toast.warning(message, options);
        break;

      case 'info':
        toastId = toast.info(message, options);
        break;

      case 'progress': {
        const timeout = (undoableTimeout ?? 5) * 1000;

        toastId = toast.warning(message, {
          ...options,
          timeout,
          actionProps: {
            children: 'Undo',
            onPress: () => {
              cancelMutation?.();
              toast.close(String(toastId!));
            },
          },
        });
        break;
      }

      default:
        toastId = toast(message, options);
    }

    this.activeNotifications.set(notificationKey, toastId);
  }

  /**
   * Dismiss a notification by its key.
   *
   * @param key - The notification key to dismiss.
   */
  close(key: string): void {
    const toastId = this.activeNotifications.get(key);

    if (toastId !== undefined) {
      toast.close(String(toastId));
      this.activeNotifications.delete(key);
    }
  }
}

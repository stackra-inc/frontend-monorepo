/**
 * @fileoverview useNotification hook.
 *
 * Resolves the NotificationService from the DI container via `useOptionalInject`.
 *
 * @module @stackra-inc/react-refine
 * @category Hooks
 */

import { useOptionalInject } from '@stackra-inc/ts-container';
import { NOTIFICATION_SERVICE } from '@/constants';
import type { INotificationService } from '@/interfaces/notification-service.interface';
import type { OpenNotificationParams } from '@/interfaces/open-notification-params.interface';

/** No-op function for when the service is not available. */
const noop = () => {};

/**
 * Hook for displaying notifications.
 *
 * Resolves the `INotificationService` from the DI container. Returns
 * no-op functions when the service is not configured.
 *
 * @returns Object with `open` and `close` methods.
 */
export function useNotification(): {
  open: (params: OpenNotificationParams) => void;
  close: (key: string) => void;
} {
  const notificationService = useOptionalInject<INotificationService>(NOTIFICATION_SERVICE);

  if (!notificationService) {
    return { open: noop, close: noop };
  }

  return {
    open: (params) => notificationService.open(params),
    close: (key) => notificationService.close(key),
  };
}

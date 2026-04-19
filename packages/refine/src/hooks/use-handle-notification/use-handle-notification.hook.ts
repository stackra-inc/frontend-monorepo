/**
 * @fileoverview useHandleNotification hook.
 *
 * Internal helper used by data hooks (useCreate, useUpdate, useDelete, etc.)
 * to fire success/error notifications. Supports the `successNotification`
 * and `errorNotification` callback pattern from upstream refine.
 *
 * If the notification config is `false`, no notification is shown.
 * If it's `undefined`, the fallback notification is used.
 *
 * @module @stackra/react-refine
 * @category Hooks
 * @internal
 */

import { useCallback } from 'react';
import { useNotification } from '@/hooks/use-notification';
import type { OpenNotificationParams } from '@/interfaces/open-notification-params.interface';

/**
 * Returns a function that conditionally opens a notification.
 *
 * @returns A handler that accepts a notification config (or `false` to suppress)
 *   and an optional fallback notification.
 *
 * @example
 * ```ts
 * const handleNotification = useHandleNotification();
 *
 * // Show a custom notification:
 * handleNotification({ message: 'Created!', type: 'success' });
 *
 * // Suppress notification:
 * handleNotification(false);
 *
 * // Use fallback when config is undefined:
 * handleNotification(undefined, { message: 'Done', type: 'success' });
 * ```
 */
export function useHandleNotification() {
  const { open } = useNotification();

  return useCallback(
    (
      notification: OpenNotificationParams | false | undefined,
      fallbackNotification?: OpenNotificationParams
    ) => {
      if (notification === false) return;

      if (notification) {
        open(notification);
      } else if (fallbackNotification) {
        open(fallbackNotification);
      }
    },
    [open]
  );
}

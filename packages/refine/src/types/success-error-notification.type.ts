/**
 * @fileoverview SuccessErrorNotification type.
 *
 * Mixin type used by data hooks to accept optional success/error
 * notification configuration. Supports static config, `false` to
 * suppress, or a callback that receives the result/error and
 * returns the config dynamically.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { OpenNotificationParams } from '@/interfaces/open-notification-params.interface';

/**
 * Notification configuration for success and error cases.
 *
 * @typeParam TData - The success response data type.
 * @typeParam TError - The error type.
 * @typeParam TVariables - The mutation variables type.
 */
export type SuccessErrorNotification<TData = unknown, TError = unknown, TVariables = unknown> = {
  /**
   * Notification to show on success.
   *
   * - `OpenNotificationParams` — static config.
   * - `false` — suppress the notification.
   * - `(data, values, resource) => ...` — dynamic config.
   */
  successNotification?:
    | OpenNotificationParams
    | false
    | ((
        data?: TData,
        values?: TVariables,
        resource?: string
      ) => OpenNotificationParams | false | undefined);

  /**
   * Notification to show on error.
   *
   * - `OpenNotificationParams` — static config.
   * - `false` — suppress the notification.
   * - `(error, values, resource) => ...` — dynamic config.
   */
  errorNotification?:
    | OpenNotificationParams
    | false
    | ((
        error?: TError,
        values?: TVariables,
        resource?: string
      ) => OpenNotificationParams | false | undefined);
};

/**
 * @fileoverview Settings change payload interface.
 *
 * Defines the shape of a real-time settings change event received
 * from the Laravel Broadcasting channel when settings are updated
 * on the backend.
 *
 * @module @stackra/ts-settings
 * @category Interfaces
 */

/**
 * Payload received from the real-time settings change broadcast.
 *
 * @description
 * When the backend dispatches a `SettingsChangeEvent` after a successful
 * settings update, the broadcast payload is deserialized into this shape
 * on the client. The {@link SettingsSyncService} uses this to merge
 * changes into the local state and notify group subscribers.
 *
 * @example
 * ```ts
 * syncService.on('theme', (payload: SettingsChangePayload) => {
 *   console.log(`Group "${payload.group}" changed fields:`, payload.changedFields);
 *   console.log('New values:', payload.values);
 * });
 * ```
 */
export interface SettingsChangePayload {
  /** The settings group key that was updated (e.g., `'theme'`). */
  group: string;

  /** Array of field keys that changed in this update. */
  changedFields: string[];

  /** New values for the changed fields. */
  values: Record<string, unknown>;

  /** Server timestamp (Unix ms) when the change was persisted. */
  timestamp: number;
}

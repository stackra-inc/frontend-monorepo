/**
 * @fileoverview Full API response shape for settings.
 *
 * Contains both the schema (what fields exist) and the
 * current values (state), as returned by a settings API endpoint.
 *
 * @module interfaces/settings-api-response
 */

import type { SettingGroupSchema } from './setting-group-schema.interface';

/**
 * Full API response shape for settings.
 * Contains both the schema (what fields exist) and the values (current state).
 */
export interface SettingsApiResponse {
  /**
   * Group schemas defining the UI structure
   */
  groups: SettingGroupSchema[];
  /**
   * Current values keyed by group key
   */
  values: Record<string, Record<string, unknown>>;
}

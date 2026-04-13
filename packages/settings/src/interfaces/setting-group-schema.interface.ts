/**
 * @fileoverview Setting group schema — JSON-serializable format.
 *
 * Describes a complete settings group as returned by an API endpoint.
 * Mirrors `ResolvedSettingGroup` but uses plain strings instead of
 * component references (no React imports needed).
 *
 * Used by `registry.registerFromSchema()` for API-driven settings.
 *
 * @module interfaces/setting-group-schema
 */

import type { SettingFieldSchema } from './setting-field-schema.interface';
import type { SettingSubGroupSchema } from './setting-sub-group-schema.interface';

// Re-export all types that were previously in this file for backwards compatibility
export type { SettingFieldSchema } from './setting-field-schema.interface';
export type { SettingSubGroupSchema } from './setting-sub-group-schema.interface';
export type { SettingsApiResponse } from './settings-api-response.interface';

/**
 * A complete group schema as returned by an API.
 */
export interface SettingGroupSchema {
  key: string;
  label: string;
  description?: string;
  /**
   * String icon name (e.g. 'monitor') — resolved to component by the UI
   */
  icon?: string;
  order?: number;
  permissions?: string[];
  writePermissions?: string[];
  fields: SettingFieldSchema[];
  groups?: SettingSubGroupSchema[];
}

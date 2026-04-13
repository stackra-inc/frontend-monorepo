/**
 * @fileoverview JSON-serializable sub-group schema interface.
 *
 * Describes a sub-group within a setting group, referencing
 * field keys that belong to it.
 *
 * @module interfaces/setting-sub-group-schema
 */

/**
 * A sub-group descriptor in JSON-serializable form.
 */
export interface SettingSubGroupSchema {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  order?: number;
  permissions?: string[];
  writePermissions?: string[];
  fieldKeys: string[];
}

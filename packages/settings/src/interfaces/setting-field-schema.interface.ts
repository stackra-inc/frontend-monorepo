/**
 * @fileoverview JSON-serializable field schema interface.
 *
 * Describes a single setting field in a format suitable for
 * API responses. Uses string identifiers instead of component
 * references (no React imports needed).
 *
 * @module interfaces/setting-field-schema
 */

import type { SettingControlType } from './built-in-control-type.type';
import type { SettingValidationRule } from './setting-validation-rule.interface';

/**
 * A field descriptor in JSON-serializable form.
 * Icons are string identifiers (e.g. lucide icon names), not components.
 */
export interface SettingFieldSchema {
  key: string;
  label: string;
  description?: string;
  control: SettingControlType;
  defaultValue: unknown;
  options?: Array<{
    value: string | number | boolean;
    label: string;
    description?: string;
    icon?: string;
    disabled?: boolean;
  }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  validation?: SettingValidationRule[];
  requiresRestart?: boolean;
  icon?: string;
  order?: number;
  visibleWhen?: { key: string; value: unknown };
  readOnly?: boolean;
  sensitive?: boolean;
  permissions?: string[];
  writePermissions?: string[];
  group?: string;
  section?: string;
  meta?: Record<string, unknown>;
}

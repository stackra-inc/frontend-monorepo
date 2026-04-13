/**
 * @fileoverview Setting field interface — re-exports.
 *
 * This file re-exports all field-related types for backwards compatibility.
 * Each type now lives in its own file.
 *
 * @module interfaces/setting-field
 */

export type { BuiltInControlType, SettingControlType } from './built-in-control-type.type';
export type { SettingValidationRule } from './setting-validation-rule.interface';
export type { AttachmentConfig } from './attachment-config.interface';
export type { MapConfig } from './map-config.interface';

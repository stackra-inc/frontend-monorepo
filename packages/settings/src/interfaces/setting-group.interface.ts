/**
 * Setting Group Interface
 *
 * Types for resolved setting groups stored in the registry.
 *
 * @module interfaces/setting-group
 */

import type { ComponentType } from 'react';
import type { FieldDescriptor } from '@/decorators/field.decorator';
import type { GroupDescriptor } from '@/decorators/group.decorator';

/**
 * Constructor type for a settings class.
 */
export type SettingDtoConstructor<T = any> = new (...args: any[]) => T;

/**
 * A fully resolved setting group stored in the registry.
 */
export interface ResolvedSettingGroup {
  /**
   * Unique group key
   */
  key: string;

  /**
   * i18n key for the title
   */
  label: string;

  /**
   * i18n key for description
   */
  description?: string;

  /**
   * Lucide icon component or string icon name (for API-driven groups)
   */
  icon?: ComponentType<{ className?: string }> | string;

  /**
   * Display order
   */
  order: number;

  /**
   * The class constructor
   */
  dto: SettingDtoConstructor;

  /**
   * All @Field() descriptors
   */
  fields: FieldDescriptor[];

  /**
   * All @Group() descriptors (sub-groups within this setting)
   */
  groups: GroupDescriptor[];

  /**
   * Permissions required to VIEW this group
   */
  permissions?: string[];

  /**
   * Permissions required to MODIFY this group
   */
  writePermissions?: string[];
}

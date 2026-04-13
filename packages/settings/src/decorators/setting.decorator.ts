/**
 * @Setting() Class Decorator
 *
 * Marks a class as a settings definition. Defines group identity
 * (key, label, icon, order) and access control (permissions).
 *
 * @module decorators/setting
 *
 * @example
 * ```ts
 * @Setting({
 *   key: 'terminal',
 *   label: 'settings.terminal',
 *   icon: Monitor,
 *   order: 2,
 *   permissions: ['settings.terminal.read'],
 *   writePermissions: ['settings.terminal.write'],
 * })
 * class TerminalSettings { ... }
 * ```
 */

import type { ComponentType } from 'react';

// ─── Metadata Keys ─────────────────────────────────────────────────

/** Symbol key for class-level @Setting() metadata */
export const SETTING_META_KEY = Symbol.for('setting:meta');

/** Symbol key for property-level @Field() metadata */
export const FIELD_META_KEY = Symbol.for('setting:fields');

/** Symbol key for @Group() metadata on properties */
export const GROUP_META_KEY = Symbol.for('setting:groups');

/** Symbol key for @Section() metadata on properties */
export const SECTION_META_KEY = Symbol.for('setting:sections');

// ─── @Setting() — Class Decorator ──────────────────────────────────

/**
 * Options for the `@Setting()` class decorator.
 */
export interface SettingOptions {
  /**
   * Unique key for this settings group.
   * @example 'display', 'terminal', 'network'
   */
  key: string;

  /**
   * i18n key for the group title.
   * @example 'settings.display'
   */
  label: string;

  /**
   * i18n key for the group description.
   */
  description?: string;

  /**
   * Lucide icon component.
   */
  icon?: ComponentType<{ className?: string }>;

  /**
   * Display order. Lower = higher.
   * @default 0
   */
  order?: number;

  /**
   * Permission strings required to VIEW this settings group.
   *
   * The settings UI checks these against the current user's
   * permissions. If the user lacks any of these, the entire
   * group is hidden.
   *
   * @example ['settings.terminal.read']
   * @example ['admin', 'settings.manage']
   */
  permissions?: string[];

  /**
   * Permission strings required to WRITE/MODIFY this settings group.
   *
   * If the user has read permissions but not write permissions,
   * the group is shown as read-only.
   *
   * @example ['settings.terminal.write']
   */
  writePermissions?: string[];
}

/**
 * Class decorator that marks a class as a settings definition.
 */
export function Setting(options: SettingOptions): ClassDecorator {
  return (target: Function) => {
    (target as any)[SETTING_META_KEY] = options;
  };
}

/**
 * Extract @Setting() metadata from a class.
 */
export function getSettingMeta(target: new (...args: any[]) => any): SettingOptions | undefined {
  return (target as any)[SETTING_META_KEY];
}

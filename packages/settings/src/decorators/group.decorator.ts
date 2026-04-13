/**
 * @Group() Property Decorator
 *
 * Assigns a field to a named group within a settings class.
 * Groups are rendered as collapsible sections in the settings UI.
 *
 * @module decorators/group
 *
 * @example
 * ```ts
 * @Setting({ key: 'terminal', label: 'settings.terminal.title', icon: Monitor })
 * class TerminalSettings {
 *   @Group({ key: 'identity', label: 'settings.terminal.identity', icon: Tag, order: 1 })
 *   @Field({ label: 'settings.terminal.id', control: 'text', defaultValue: '' })
 *   terminalId: string = '';
 *
 *   @Group({ key: 'identity', label: 'settings.terminal.identity', icon: Tag, order: 1 })
 *   @Field({ label: 'settings.terminal.name', control: 'text', defaultValue: 'Main Counter' })
 *   stationName: string = 'Main Counter';
 *
 *   @Group({ key: 'hardware', label: 'settings.terminal.hardware', icon: Printer, order: 2 })
 *   @Field({ label: 'settings.terminal.receipt', control: 'select', defaultValue: 'thermal' })
 *   receiptFormat: string = 'thermal';
 * }
 * ```
 */

import type { ComponentType } from 'react';
import { GROUP_META_KEY, FIELD_META_KEY } from './setting.decorator';
import type { FieldDescriptor } from './field.decorator';

/**
 * Options for the `@Group()` property decorator.
 */
export interface GroupOptions {
  /** Unique key for this group within the settings class */
  key: string;

  /** i18n key for the group title */
  label: string;

  /** i18n key for optional description */
  description?: string;

  /** Lucide icon component or string icon name */
  icon?: ComponentType<{ className?: string }> | string;

  /** Display order (lower = first) */
  order?: number;

  /**
   * Permission strings required to VIEW this sub-group.
   * If the user lacks these, all fields in this group are hidden.
   */
  permissions?: string[];

  /**
   * Permission strings required to MODIFY fields in this sub-group.
   */
  writePermissions?: string[];
}

/**
 * Resolved group metadata stored on the class.
 */
export interface GroupDescriptor extends GroupOptions {
  /** Field keys that belong to this group */
  fieldKeys: string[];
}

/**
 * Property decorator that assigns a field to a named group.
 *
 * @param options - Group metadata
 */
export function Group(options: GroupOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const constructor = target.constructor as any;

    /** Store group definitions on the class */
    if (!constructor[GROUP_META_KEY]) {
      constructor[GROUP_META_KEY] = new Map<string, GroupDescriptor>();
    }

    const groups: Map<string, GroupDescriptor> = constructor[GROUP_META_KEY];

    /** Create or update the group */
    if (!groups.has(options.key)) {
      groups.set(options.key, { ...options, fieldKeys: [] });
    }

    /** Add this field to the group */
    groups.get(options.key)!.fieldKeys.push(String(propertyKey));

    /** Also tag the field descriptor with the group key */
    if (constructor[FIELD_META_KEY]) {
      const field: FieldDescriptor | undefined = constructor[FIELD_META_KEY].get(
        String(propertyKey)
      );
      if (field) {
        field.group = options.key;
      }
    }
  };
}

/**
 * Extract all @Group() descriptors from a class, sorted by order.
 *
 * @param dto - The class constructor
 * @returns Array of group descriptors
 */
export function getGroupDescriptors(dto: new (...args: any[]) => any): GroupDescriptor[] {
  const map: Map<string, GroupDescriptor> | undefined = (dto as any)[GROUP_META_KEY];
  if (!map) return [];

  return Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

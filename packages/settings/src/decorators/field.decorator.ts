/**
 * @Field() Property Decorator
 *
 * Marks a property as a configurable setting field.
 * Supports RBAC permissions, dynamic options, and all control types.
 *
 * @module decorators/field
 *
 * @example
 * ```ts
 * @Setting({ key: 'locale', label: 'settings.locale', icon: Globe })
 * class LocaleSettings {
 *   // Static options
 *   @Field({
 *     label: 'settings.locale.date_format',
 *     control: 'select',
 *     defaultValue: 'DD/MM/YYYY',
 *     options: [
 *       { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
 *       { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
 *     ],
 *   })
 *   dateFormat: string = 'DD/MM/YYYY';
 *
 *   // Dynamic options — resolved at render time
 *   @Field({
 *     label: 'settings.locale.ui_locale',
 *     control: 'locale',
 *     defaultValue: 'en',
 *     optionsProvider: () => fetchSupportedLocales(),
 *   })
 *   uiLocale: string = 'en';
 *
 *   // Field-level RBAC
 *   @Field({
 *     label: 'settings.locale.api_url',
 *     control: 'text',
 *     defaultValue: '',
 *     permissions: ['admin'],
 *   })
 *   apiUrl: string = '';
 * }
 * ```
 */

import type { ComponentType } from 'react';
import type { SettingControlType } from '@/interfaces/built-in-control-type.type';
import type { SettingValidationRule } from '@/interfaces/setting-validation-rule.interface';
import type { AttachmentConfig } from '@/interfaces/attachment-config.interface';
import type { MapConfig } from '@/interfaces/map-config.interface';
import { FIELD_META_KEY } from './setting.decorator';

// ─── Option Type ───────────────────────────────────────────────────

/**
 * A single option for select, radio, segment controls.
 */
export interface FieldOption {
  /** The stored value */
  value: string | number | boolean;

  /**
   * Display label.
   * Can be a plain string or an i18n key — the UI renderer decides.
   * For options that are inherently language-specific (locale names,
   * currency symbols), use plain strings. For translatable labels,
   * use i18n keys.
   */
  label: string;

  /** i18n key for optional hint text */
  description?: string;

  /** Lucide icon component or emoji/symbol string */
  icon?: ComponentType<{ className?: string }> | string;

  /** If true, this option is disabled but visible */
  disabled?: boolean;
}

// ─── Options Provider ──────────────────────────────────────────────

/**
 * A function that returns options dynamically at render time.
 *
 * Can be sync or async. The settings UI calls this when the field
 * is rendered and caches the result. Useful for options that come
 * from an API, config, or depend on other settings.
 *
 * @returns Array of options, or a Promise that resolves to options
 *
 * @example
 * ```ts
 * // Sync provider
 * optionsProvider: () => getSupportedLocales().map(l => ({ value: l.code, label: l.name }))
 *
 * // Async provider
 * optionsProvider: async () => {
 *   const res = await fetch('/api/currencies');
 *   return res.json();
 * }
 * ```
 */
export type OptionsProvider = () => FieldOption[] | Promise<FieldOption[]>;

// ─── Field Descriptor ──────────────────────────────────────────────

/**
 * Complete descriptor for one setting field.
 */
export interface FieldDescriptor {
  /** Property key on the class (auto-set by decorator) */
  key: string;

  /** i18n key for the field label */
  label: string;

  /** i18n key for help text below the control */
  description?: string;

  /**
   * UI control type. Built-in or custom string.
   * @default 'text'
   */
  control: SettingControlType;

  /** Default value for this field */
  defaultValue: unknown;

  /**
   * Static options for select/radio/segment controls.
   * Mutually exclusive with `optionsProvider` — if both are set,
   * `optionsProvider` takes precedence.
   */
  options?: FieldOption[];

  /**
   * Dynamic options provider.
   * Called at render time to fetch options. Takes precedence over
   * static `options` if both are set.
   */
  optionsProvider?: OptionsProvider;

  /** Min value for slider/number */
  min?: number;

  /** Max value for slider/number */
  max?: number;

  /** Step for slider/number */
  step?: number;

  /** Placeholder text (plain string or i18n key) */
  placeholder?: string;

  /** Validation rules */
  validation?: SettingValidationRule[];

  /** Requires app restart to take effect */
  requiresRestart?: boolean;

  /** Lucide icon component or string icon name (for API-driven fields) */
  icon?: ComponentType<{ className?: string }> | string;

  /** Display order within the group (lower = first) */
  order?: number;

  /**
   * Conditional visibility — field only shows when condition is met.
   * @example { key: 'advancedMode', value: true }
   */
  visibleWhen?: { key: string; value: unknown };

  /** Read-only in the UI */
  readOnly?: boolean;

  /** Sensitive value — masked in logs/exports */
  sensitive?: boolean;

  /** Config for 'attachment' control */
  attachmentConfig?: AttachmentConfig;

  /** Config for 'map' control */
  mapConfig?: MapConfig;

  /** Arbitrary metadata for custom controls */
  meta?: Record<string, unknown>;

  /**
   * Permission strings required to VIEW this field.
   *
   * If the user lacks these permissions, the field is hidden
   * even if the parent group is visible.
   *
   * @example ['admin']
   * @example ['settings.terminal.advanced']
   */
  permissions?: string[];

  /**
   * Permission strings required to MODIFY this field.
   *
   * If the user can view but not write, the field renders
   * as read-only.
   *
   * @example ['settings.terminal.write']
   */
  writePermissions?: string[];

  /**
   * Group key — set by @Group() decorator.
   * @internal
   */
  group?: string;

  /**
   * Section label — set by @Section() decorator.
   * @internal
   */
  section?: string;
}

/**
 * Options accepted by the `@Field()` decorator.
 * Same as FieldDescriptor but without auto-set internal fields.
 */
export type FieldOptions = Omit<FieldDescriptor, 'key' | 'group' | 'section'>;

/**
 * Property decorator that registers a class property as a setting field.
 */
export function Field(options: FieldOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const constructor = target.constructor as any;

    if (!constructor[FIELD_META_KEY]) {
      constructor[FIELD_META_KEY] = new Map<string, FieldDescriptor>();
    }

    const descriptor: FieldDescriptor = {
      ...options,
      key: String(propertyKey),
    };

    constructor[FIELD_META_KEY].set(String(propertyKey), descriptor);
  };
}

/**
 * Extract all @Field() descriptors from a class, sorted by order then key.
 */
export function getFieldDescriptors(dto: new (...args: any[]) => any): FieldDescriptor[] {
  const map: Map<string, FieldDescriptor> | undefined = (dto as any)[FIELD_META_KEY];
  if (!map) return [];

  return Array.from(map.values()).sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    return orderDiff !== 0 ? orderDiff : a.key.localeCompare(b.key);
  });
}

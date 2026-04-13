/**
 * @Section() Property Decorator
 *
 * Inserts a visual separator/divider before a field in the settings UI.
 * Sections are purely visual — they don't affect data structure.
 *
 * @module decorators/section
 *
 * @example
 * ```ts
 * @Setting({ key: 'terminal', label: 'settings.terminal.title', icon: Monitor })
 * class TerminalSettings {
 *   @Field({ label: 'settings.terminal.id', control: 'text', defaultValue: '' })
 *   terminalId: string = '';
 *
 *   @Section({ label: 'settings.terminal.hardware_section' })
 *   @Field({ label: 'settings.terminal.receipt', control: 'select', defaultValue: 'thermal' })
 *   receiptFormat: string = 'thermal';
 *
 *   @Section({ label: 'settings.terminal.security_section' })
 *   @Field({ label: 'settings.terminal.idle_lock', control: 'number', defaultValue: 15 })
 *   idleLockMinutes: number = 15;
 * }
 * ```
 */

import { SECTION_META_KEY, FIELD_META_KEY } from './setting.decorator';
import type { FieldDescriptor } from './field.decorator';

/**
 * Options for the `@Section()` property decorator.
 */
export interface SectionOptions {
  /** i18n key for the section title */
  label: string;

  /** i18n key for optional description */
  description?: string;
}

/**
 * Property decorator that inserts a visual section divider before a field.
 *
 * @param options - Section metadata
 */
export function Section(options: SectionOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const constructor = target.constructor as any;

    /** Store section markers on the class */
    if (!constructor[SECTION_META_KEY]) {
      constructor[SECTION_META_KEY] = new Map<string, SectionOptions>();
    }

    constructor[SECTION_META_KEY].set(String(propertyKey), options);

    /** Also tag the field descriptor with the section label */
    if (constructor[FIELD_META_KEY]) {
      const field: FieldDescriptor | undefined = constructor[FIELD_META_KEY].get(
        String(propertyKey)
      );
      if (field) {
        field.section = options.label;
      }
    }
  };
}

/**
 * Get section metadata for a specific field.
 *
 * @param dto - The class constructor
 * @param fieldKey - The property key
 * @returns Section options, or undefined if no section before this field
 */
export function getSectionForField(
  dto: new (...args: any[]) => any,
  fieldKey: string
): SectionOptions | undefined {
  const map: Map<string, SectionOptions> | undefined = (dto as any)[SECTION_META_KEY];
  return map?.get(fieldKey);
}

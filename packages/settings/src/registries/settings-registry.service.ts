/**
 * Settings Registry
 *
 * Central registry holding all registered setting groups.
 * Classes decorated with `@Setting()` are registered here via
 * `SettingsModule.forFeature()`.
 *
 * @module registry/settings-registry
 */

import { getSettingMeta } from '@/decorators/setting.decorator';
import { getFieldDescriptors } from '@/decorators/field.decorator';
import { getGroupDescriptors } from '@/decorators/group.decorator';
import type {
  SettingDtoConstructor,
  ResolvedSettingGroup,
} from '@/interfaces/setting-group.interface';
import type { SettingGroupSchema } from '@/interfaces/setting-group-schema.interface';

/**
 * Central settings registry.
 */
export class SettingsRegistry {
  /** Internal storage keyed by group key */
  private readonly groups = new Map<string, ResolvedSettingGroup>();

  /**
   * Register a settings class decorated with `@Setting()`.
   *
   * Reads class-level metadata from `@Setting()`, field metadata
   * from `@Field()`, and group metadata from `@Group()`.
   *
   * @param dto - The decorated settings class
   * @throws Error if not decorated with `@Setting()`
   * @throws Error if key is already registered
   */
  registerClass(dto: SettingDtoConstructor): void {
    const meta = getSettingMeta(dto);

    if (!meta) {
      throw new Error(
        `[SettingsRegistry] Class "${dto.name}" is not decorated with @Setting(). ` +
          `Add @Setting({ key: '...', label: '...' }) to the class.`
      );
    }

    if (this.groups.has(meta.key)) {
      throw new Error(
        `[SettingsRegistry] Group "${meta.key}" is already registered. ` +
          `Each group key must be unique.`
      );
    }

    const fields = getFieldDescriptors(dto);
    const groups = getGroupDescriptors(dto);

    if (fields.length === 0) {
      console.warn(
        `[SettingsRegistry] Class "${dto.name}" (key: "${meta.key}") has no @Field() properties.`
      );
    }

    const resolved: ResolvedSettingGroup = {
      key: meta.key,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      order: meta.order ?? 0,
      dto,
      fields,
      groups,
      permissions: meta.permissions,
      writePermissions: meta.writePermissions,
    };

    this.groups.set(meta.key, resolved);
  }

  /** Get a group by key */
  get(key: string): ResolvedSettingGroup | undefined {
    return this.groups.get(key);
  }

  /** Get all groups sorted by order */
  getAll(): ResolvedSettingGroup[] {
    return Array.from(this.groups.values()).sort((a, b) => a.order - b.order);
  }

  /** Check if a group exists */
  has(key: string): boolean {
    return this.groups.has(key);
  }

  /** Number of registered groups */
  get size(): number {
    return this.groups.size;
  }

  /** Find the group that owns a DTO class */
  findByDto(dto: new (...args: any[]) => any): ResolvedSettingGroup | undefined {
    for (const group of this.groups.values()) {
      if (group.dto === dto) return group;
    }
    return undefined;
  }

  /**
   * Find a group by key and return it for key-based access.
   * Used by the service when working with API-driven groups
   * that have no DTO class.
   *
   * @param key - The group key
   */
  findByKey(key: string): ResolvedSettingGroup | undefined {
    return this.groups.get(key);
  }

  /**
   * Register a group from a plain JSON schema (no DTO class needed).
   *
   * Use this when the backend owns the schema and sends it via API.
   * The fields are plain objects matching the FieldDescriptor shape.
   * No `@Setting()` or `@Field()` decorators required.
   *
   * @param schema - The group schema from the API
   *
   * @example
   * ```ts
   * // API response:
   * const apiResponse = await fetch('/api/settings/schema');
   * const groups = await apiResponse.json();
   *
   * // Register each group
   * for (const group of groups) {
   *   registry.registerFromSchema(group);
   * }
   * ```
   *
   * @example
   * ```ts
   * registry.registerFromSchema({
   *   key: 'display',
   *   label: 'settings.display',
   *   icon: 'monitor',
   *   order: 1,
   *   fields: [
   *     { key: 'compact', label: 'settings.display.compact', control: 'toggle', defaultValue: false },
   *     { key: 'brightness', label: 'settings.display.brightness', control: 'slider', defaultValue: 100, min: 20, max: 100 },
   *   ],
   * });
   * ```
   */
  registerFromSchema(schema: SettingGroupSchema): void {
    if (this.groups.has(schema.key)) {
      throw new Error(`[SettingsRegistry] Group "${schema.key}" is already registered.`);
    }

    const resolved: ResolvedSettingGroup = {
      key: schema.key,
      label: schema.label,
      description: schema.description,
      icon: schema.icon, // String icon name from API
      order: schema.order ?? 0,
      dto: null as any, // No DTO class for API-driven groups
      fields: (schema.fields ?? []).map((f, i) => ({
        ...f,
        order: f.order ?? i,
      })),
      groups: schema.groups ?? [],
      permissions: schema.permissions,
      writePermissions: schema.writePermissions,
    };

    this.groups.set(schema.key, resolved);
  }

  /**
   * Register multiple groups from an API response at once.
   *
   * @param schemas - Array of group schemas
   */
  registerManyFromSchema(schemas: SettingGroupSchema[]): void {
    for (const schema of schemas) {
      this.registerFromSchema(schema);
    }
  }

  /**
   * Clear all registered groups.
   * Useful when reloading schema from API.
   */
  clear(): void {
    this.groups.clear();
  }

  /**
   * Generate a JSON schema for all registered groups.
   * Useful for backend contract validation.
   */
  toSchema(): Record<string, unknown> {
    const schema: Record<string, unknown> = {};

    for (const group of this.groups.values()) {
      const properties: Record<string, unknown> = {};

      for (const field of group.fields) {
        properties[field.key] = {
          type: controlToSchemaType(field.control),
          default: field.defaultValue,
          ...(field.options ? { enum: field.options.map((o) => o.value) } : {}),
          ...(field.min !== undefined ? { minimum: field.min } : {}),
          ...(field.max !== undefined ? { maximum: field.max } : {}),
        };
      }

      schema[group.key] = { type: 'object', properties };
    }

    return schema;
  }
}

/** Map control type to JSON Schema type */
function controlToSchemaType(control: string): string {
  switch (control) {
    case 'toggle':
      return 'boolean';
    case 'slider':
    case 'number':
      return 'number';
    case 'list':
    case 'tags':
      return 'array';
    case 'json':
    case 'keyValue':
    case 'map':
      return 'object';
    default:
      return 'string';
  }
}

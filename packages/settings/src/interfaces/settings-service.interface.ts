/**
 * Settings Service Interface
 *
 * Contract for the public settings API. Consumers use this to
 * read, write, and observe setting values.
 *
 * @module interfaces/settings-service
 */

import type { SettingDtoConstructor, ResolvedSettingGroup } from './setting-group.interface';

/**
 * Public API for the settings system.
 *
 * @example
 * ```ts
 * // Get all values for a group
 * const display = settings.get(DisplaySettings);
 *
 * // Update a single field
 * settings.set(DisplaySettings, 'compact', true);
 *
 * // Reset a group to defaults
 * settings.reset(DisplaySettings);
 *
 * // Get all registered groups (for rendering the settings UI)
 * const groups = settings.getGroups();
 * ```
 */
export interface SettingsServiceInterface {
  /**
   * Get the current values for a settings group.
   *
   * Returns a plain object with all field values, merged with defaults
   * for any fields that haven't been explicitly set.
   *
   * @template T - The DTO type
   * @param dto - The DTO class constructor
   * @returns Current values as a plain object matching the DTO shape
   */
  get<T>(dto: SettingDtoConstructor<T>): T;

  /**
   * Update a single field within a settings group.
   *
   * Validates the value against the field descriptor and persists
   * the change according to the configured persistence driver.
   *
   * @template T - The DTO type
   * @param dto - The DTO class constructor
   * @param key - The field key to update
   * @param value - The new value
   */
  set<T>(dto: SettingDtoConstructor<T>, key: keyof T & string, value: unknown): void;

  /**
   * Update multiple fields within a settings group at once.
   *
   * @template T - The DTO type
   * @param dto - The DTO class constructor
   * @param values - Partial object with fields to update
   */
  setMany<T>(dto: SettingDtoConstructor<T>, values: Partial<T>): void;

  /**
   * Reset a settings group to its default values.
   *
   * Removes all persisted values for the group, so the next `get()`
   * returns the defaults defined in the DTO decorators.
   *
   * @template T - The DTO type
   * @param dto - The DTO class constructor
   */
  reset<T>(dto: SettingDtoConstructor<T>): void;

  /**
   * Get all registered setting groups.
   *
   * Used by the settings UI to render all available groups and fields.
   *
   * @returns Array of resolved setting groups, sorted by order
   */
  getGroups(): ResolvedSettingGroup[];

  /**
   * Get a specific registered group by its key.
   *
   * @param key - The group key
   * @returns The resolved group, or undefined if not found
   */
  getGroup(key: string): ResolvedSettingGroup | undefined;

  /**
   * Export all settings as a JSON-serializable object.
   *
   * Useful for backup, sync, or sending to the backend.
   *
   * @returns Object keyed by group key, values are the group's current values
   */
  exportAll(): Record<string, Record<string, unknown>>;

  /**
   * Import settings from a JSON object.
   *
   * Merges the imported values with current values. Does not remove
   * fields that aren't in the import.
   *
   * @param data - Object keyed by group key
   */
  importAll(data: Record<string, Record<string, unknown>>): void;
}

/**
 * Settings Store Interface
 *
 * Contract for persistence drivers. Same pattern as the cache
 * package's `Store` interface.
 *
 * @module stores/settings-store
 */

/**
 * A persistence driver for settings values.
 */
export interface SettingsStore {
  /**
   * Driver name (e.g. 'localStorage', 'api', 'memory')
   */
  readonly driver: string;

  /**
   * Load persisted values for a group.
   * Returns empty object if nothing is persisted.
   */
  load(groupKey: string): Record<string, unknown> | Promise<Record<string, unknown>>;

  /**
   * Save values for a group.
   */
  save(groupKey: string, values: Record<string, unknown>): void | Promise<void>;

  /**
   * Clear persisted values for a group.
   */
  clear(groupKey: string): void | Promise<void>;
}

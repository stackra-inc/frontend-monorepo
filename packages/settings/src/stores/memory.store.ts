/**
 * Memory Settings Store
 *
 * In-memory only — values are lost on page refresh.
 * Useful for testing or ephemeral settings.
 *
 * @module stores/memory
 */

import type { SettingsStore } from '../interfaces/settings-store.interface';

/**
 * In-memory settings store.
 */
export class MemoryStore implements SettingsStore {
  readonly driver = 'memory';

  /** In-memory storage keyed by group key */
  private readonly data = new Map<string, Record<string, unknown>>();

  /** Load from memory */
  load(groupKey: string): Record<string, unknown> {
    return this.data.get(groupKey) ?? {};
  }

  /** Save to memory */
  save(groupKey: string, values: Record<string, unknown>): void {
    this.data.set(groupKey, { ...values });
  }

  /** Clear from memory */
  clear(groupKey: string): void {
    this.data.delete(groupKey);
  }
}

/**
 * LocalStorage Settings Store
 *
 * Persists settings to browser localStorage.
 * Fast, synchronous, works offline. Good default for POS terminals.
 *
 * @module stores/local-storage
 */

import type { SettingsStore } from '../interfaces/settings-store.interface';

/**
 * localStorage-backed settings store.
 */
export class LocalStorageStore implements SettingsStore {
  readonly driver = 'localStorage';

  constructor(
    /** Key prefix — each group stored under `{prefix}:{groupKey}` */
    private readonly prefix: string
  ) {}

  /** Load values from localStorage */
  load(groupKey: string): Record<string, unknown> {
    try {
      const raw = globalThis.localStorage?.getItem(this.key(groupKey));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /** Save values to localStorage */
  save(groupKey: string, values: Record<string, unknown>): void {
    try {
      globalThis.localStorage?.setItem(this.key(groupKey), JSON.stringify(values));
    } catch {
      /* quota exceeded — fail silently */
    }
  }

  /** Remove values from localStorage */
  clear(groupKey: string): void {
    try {
      globalThis.localStorage?.removeItem(this.key(groupKey));
    } catch {
      /* ignore */
    }
  }

  /** Build the full storage key */
  private key(groupKey: string): string {
    return `${this.prefix}:${groupKey}`;
  }
}

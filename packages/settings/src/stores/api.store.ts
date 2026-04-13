/**
 * API Settings Store
 *
 * Persists settings to a REST API backend.
 * Supports custom headers, timeout, custom fetch, error callbacks,
 * and fallback to another store when offline.
 *
 * @module stores/api
 */

import type { SettingsStore } from '../interfaces/settings-store.interface';
import type { ApiStoreConfig } from '@/interfaces/api-store-config.interface';

/**
 * REST API-backed settings store.
 *
 * - GET    `{baseUrl}/{groupKey}` — load
 * - PUT    `{baseUrl}/{groupKey}` — save
 * - DELETE `{baseUrl}/{groupKey}` — clear
 */
export class ApiStore implements SettingsStore {
  readonly driver = 'api';

  constructor(
    /** API store configuration */
    private readonly config: ApiStoreConfig,
    /** Optional fallback store for offline scenarios */
    private readonly fallback?: SettingsStore
  ) {}

  /** Load values from the API (async) */
  async load(groupKey: string): Promise<Record<string, unknown>> {
    try {
      const res = await this.fetch(groupKey, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const values = await res.json();

      // Update fallback cache on success
      if (this.fallback) {
        try {
          await this.fallback.save(groupKey, values);
        } catch {
          /* ignore */
        }
      }

      return values;
    } catch (err) {
      this.config.onError?.(err as Error, groupKey, 'load');

      // Fall back to local cache if available
      if (this.fallback) {
        return this.fallback.load(groupKey);
      }
      return {};
    }
  }

  /** Save values to the API (fire-and-forget with fallback) */
  async save(groupKey: string, values: Record<string, unknown>): Promise<void> {
    // Always update fallback immediately (optimistic)
    if (this.fallback) {
      try {
        await this.fallback.save(groupKey, values);
      } catch {
        /* ignore */
      }
    }

    try {
      const res = await this.fetch(groupKey, {
        method: 'PUT',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      this.config.onError?.(err as Error, groupKey, 'save');
      // Fallback already updated above — data is safe locally
    }
  }

  /** Clear values via the API */
  async clear(groupKey: string): Promise<void> {
    // Clear fallback too
    if (this.fallback) {
      try {
        await this.fallback.clear(groupKey);
      } catch {
        /* ignore */
      }
    }

    try {
      const res = await this.fetch(groupKey, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      this.config.onError?.(err as Error, groupKey, 'clear');
    }
  }

  // ─── Private ─────────────────────────────────────────────────────

  /** Execute a fetch request with headers, timeout, and custom fetch fn */
  private async fetch(groupKey: string, init: RequestInit): Promise<Response> {
    const fetchFn = this.config.fetchFn ?? globalThis.fetch.bind(globalThis);
    const timeout = this.config.timeout ?? 10000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.resolveHeaders(),
    };

    try {
      return await fetchFn(`${this.config.baseUrl}/${groupKey}`, {
        ...init,
        headers: { ...headers, ...((init.headers as Record<string, string>) ?? {}) },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  /** Resolve headers — static object or dynamic function */
  private resolveHeaders(): Record<string, string> {
    const h = this.config.headers;
    if (!h) return {};
    return typeof h === 'function' ? h() : h;
  }
}

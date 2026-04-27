/**
 * @fileoverview Realtime store configuration interface.
 *
 * Configuration for the `RealtimeStore` driver, which extends the
 * API store with real-time subscription capabilities via
 * `@stackra/ts-realtime`.
 *
 * @module @stackra/ts-settings
 * @category Interfaces
 */

import type { BaseStoreConfig } from './base-store-config.interface';

/**
 * Configuration for the `RealtimeStore` driver.
 *
 * @description
 * Extends {@link BaseStoreConfig} with the same API-related options as
 * {@link ApiStoreConfig} (base URL, headers, timeout, custom fetch,
 * error callback, fallback store) plus the `'realtime'` driver discriminant.
 *
 * The `RealtimeStore` uses these API options for initial data fetching
 * and write operations, while subscribing to real-time channels via
 * `RealtimeManager` from `@stackra/ts-realtime` for live updates.
 *
 * @example
 * ```ts
 * const config: RealtimeStoreConfig = {
 *   driver: 'realtime',
 *   baseUrl: '/api/v1/settings',
 *   headers: () => ({ Authorization: `Bearer ${getToken()}` }),
 *   timeout: 10000,
 *   fallbackStore: 'local',
 * };
 * ```
 */
export interface RealtimeStoreConfig extends BaseStoreConfig {
  /** Driver discriminant for the realtime store. */
  driver: 'realtime';

  /**
   * Base URL for the settings API.
   *
   * - GET    `{baseUrl}/{groupKey}` — load values
   * - PUT    `{baseUrl}/{groupKey}` — save values
   * - DELETE `{baseUrl}/{groupKey}` — reset to defaults
   */
  baseUrl: string;

  /**
   * Extra headers — static object or dynamic function.
   *
   * Dynamic is useful for auth tokens, tenant IDs, etc.
   *
   * @example
   * ```ts
   * headers: () => ({
   *   'Authorization': `Bearer ${getToken()}`,
   *   'X-Tenant-ID': getCurrentTenantId(),
   * })
   * ```
   */
  headers?: Record<string, string> | (() => Record<string, string>);

  /**
   * Request timeout in milliseconds.
   *
   * @default 10000
   */
  timeout?: number;

  /**
   * Custom fetch function — integrate with axios, ky, etc.
   *
   * @example
   * ```ts
   * fetchFn: (url, init) => axiosInstance(url, init)
   * ```
   */
  fetchFn?: (url: string, init: RequestInit) => Promise<Response>;

  /**
   * Called when an API request fails.
   *
   * @param error - The error that occurred
   * @param groupKey - The settings group key
   * @param operation - The operation that failed
   */
  onError?: (error: Error, groupKey: string, operation: 'load' | 'save' | 'clear') => void;

  /**
   * Name of another store to fall back to when the API is unreachable.
   *
   * Typically `'local'` for offline-capable scenarios.
   */
  fallbackStore?: string;
}

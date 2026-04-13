/**
 * @fileoverview API store configuration interface.
 *
 * Configuration for the REST API persistence driver, including
 * base URL, headers, timeout, custom fetch, error handling,
 * and fallback store support.
 *
 * @module interfaces/api-store-config
 */

import type { BaseStoreConfig } from './base-store-config.interface';

/**
 * Config for the API driver
 */
export interface ApiStoreConfig extends BaseStoreConfig {
  driver: 'api';

  /**
   * Base URL for the settings API.
   * - GET    `{baseUrl}/{groupKey}` — load values
   * - PUT    `{baseUrl}/{groupKey}` — save values
   * - DELETE `{baseUrl}/{groupKey}` — reset to defaults
   */
  baseUrl: string;

  /**
   * Extra headers — static object or dynamic function.
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
   * Request timeout in ms. @default 10000
   */
  timeout?: number;

  /**
   * Custom fetch function — integrate with axios, ky, etc.
   * @example fetchFn: (url, init) => axiosInstance(url, init)
   */
  fetchFn?: (url: string, init: RequestInit) => Promise<Response>;

  /**
   * Called when an API request fails
   */
  onError?: (error: Error, groupKey: string, operation: 'load' | 'save' | 'clear') => void;

  /**
   * Name of another store to fall back to when the API is unreachable.
   * Typically 'local' for offline-capable POS terminals.
   */
  fallbackStore?: string;
}

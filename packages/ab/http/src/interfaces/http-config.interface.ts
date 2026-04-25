/**
 * @fileoverview HTTP client configuration interface
 *
 * Defines the global configuration for the HTTP client instance.
 * These values are provided via `HttpModule.forRoot()` and injected
 * into the HttpClient service via the `HTTP_CONFIG` token.
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import type { HttpClientConfig } from '@stackra/ts-http';
 *
 * const config: HttpClientConfig = {
 *   baseURL: 'https://api.example.com',
 *   timeout: 10000,
 *   headers: {
 *     'Accept': 'application/json',
 *     'X-App-Version': '1.0.0',
 *   },
 * };
 * ```
 */

/**
 * Global configuration for the HTTP client.
 *
 * Applied as defaults to every request. Per-request config
 * in `HttpRequestConfig` overrides these values.
 */
export interface HttpClientConfig {
  /**
   * Base URL prepended to all relative request URLs.
   *
   * @example 'https://api.example.com/v1'
   */
  baseURL?: string;

  /**
   * Default request timeout in milliseconds.
   * Individual requests can override this value.
   *
   * @default 30000
   */
  timeout?: number;

  /**
   * Default headers applied to every request.
   * Per-request headers are merged on top of these.
   */
  headers?: Record<string, string>;
}

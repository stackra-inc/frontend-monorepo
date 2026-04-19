/**
 * @fileoverview HTTP request configuration interface
 *
 * Defines the shape of request configuration objects passed to the
 * HTTP client methods. Wraps the most common axios config options
 * with a clean, framework-agnostic API.
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import { HttpMethod } from '@stackra/ts-http';
 * import type { HttpRequestConfig } from '@stackra/ts-http';
 *
 * const config: HttpRequestConfig = {
 *   url: '/api/users',
 *   method: HttpMethod.POST,
 *   baseURL: 'https://api.example.com',
 *   headers: { 'X-Custom': 'value' },
 *   data: { name: 'John', email: 'john@example.com' },
 *   timeout: 5000,
 *   meta: { skipAuth: true },
 * };
 * ```
 */

import type { HttpMethod } from '@/enums/http-method.enum';

/**
 * Configuration object for an HTTP request.
 *
 * Passed to `HttpClient.request()` or as the optional config
 * parameter on convenience methods (`get`, `post`, etc.).
 */
export interface HttpRequestConfig {
  /**
   * The request URL path (relative to `baseURL` if set).
   *
   * @example '/api/users/123'
   */
  url?: string;

  /**
   * HTTP method to use for the request.
   * Defaults to `GET` when not specified.
   */
  method?: HttpMethod;

  /**
   * Base URL prepended to `url` unless `url` is absolute.
   *
   * @example 'https://api.example.com'
   */
  baseURL?: string;

  /**
   * Request headers as key-value pairs.
   * Merged with any default headers from the HTTP config.
   */
  headers?: Record<string, string>;

  /**
   * URL query parameters.
   * Serialized and appended to the URL automatically.
   */
  params?: Record<string, any>;

  /**
   * Request body data.
   * Automatically serialized based on Content-Type.
   */
  data?: any;

  /**
   * Request timeout in milliseconds.
   * Overrides the global timeout from HttpClientConfig.
   */
  timeout?: number;

  /**
   * AbortSignal for request cancellation.
   * Pass an AbortController's signal to cancel in-flight requests.
   */
  signal?: AbortSignal;

  /**
   * Expected response type.
   * Determines how the response body is parsed.
   *
   * @default 'json'
   */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';

  /**
   * Callback invoked during upload progress.
   * Only fires for requests with a body (POST, PUT, PATCH).
   *
   * @param progress - The progress event from the HTTP adapter.
   */
  onUploadProgress?: (progress: any) => void;

  /**
   * Callback invoked during download progress.
   *
   * @param progress - The progress event from the HTTP adapter.
   */
  onDownloadProgress?: (progress: any) => void;

  /**
   * Custom metadata for middleware consumption.
   * Middleware can read these values to alter behavior per-request.
   *
   * @example `{ skipAuth: true, retryCount: 5 }`
   */
  meta?: Record<string, any>;
}

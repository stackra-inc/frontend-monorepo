/**
 * @fileoverview HTTP response interface
 *
 * Defines the normalized response shape returned by the HTTP client
 * after a successful request. Wraps the raw axios response into a
 * clean, framework-agnostic structure.
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import type { HttpResponse } from '@stackra/ts-http';
 *
 * const response: HttpResponse<User> = await http.get<User>('/api/users/1');
 * console.log(response.data);       // User object
 * console.log(response.status);     // 200
 * console.log(response.statusText); // 'OK'
 * console.log(response.headers);    // { 'content-type': 'application/json' }
 * ```
 */

import type { HttpRequestConfig } from './http-request.interface';

/**
 * Normalized HTTP response returned by all client methods.
 *
 * @typeParam T - The expected shape of the response body data.
 */
export interface HttpResponse<T = any> {
  /**
   * Parsed response body.
   * The type is determined by the `responseType` in the request config.
   */
  data: T;

  /**
   * HTTP status code (e.g. 200, 201, 404, 500).
   */
  status: number;

  /**
   * HTTP status text (e.g. 'OK', 'Not Found', 'Internal Server Error').
   */
  statusText: string;

  /**
   * Response headers as a flat key-value record.
   * Header names are lowercased per HTTP/2 convention.
   */
  headers: Record<string, string>;

  /**
   * The original request configuration that produced this response.
   * Useful for retry logic and debugging.
   */
  config: HttpRequestConfig;
}

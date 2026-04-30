/**
 * @fileoverview HTTP error interface
 *
 * Defines the normalized error shape thrown by the HTTP client
 * and the ErrorNormalizerMiddleware. Provides a consistent structure
 * for error handling regardless of the underlying error type
 * (network error, timeout, HTTP error response).
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import type { HttpError } from '@stackra/ts-http';
 *
 * try {
 *   await http.post('/api/users', { name: '' });
 * } catch (error) {
 *   if (isHttpError(error)) {
 *     console.log(error.statusCode);  // 422
 *     console.log(error.errors);      // { name: ['Name is required'] }
 *   }
 * }
 *
 * // Type guard function
 * function isHttpError(error: unknown): error is HttpError {
 *   return typeof error === 'object' && error !== null && 'isHttpError' in error;
 * }
 * ```
 */

import type { HttpRequestConfig } from './http-request.interface';
import type { HttpResponse } from './http-response.interface';

/**
 * Normalized HTTP error structure.
 *
 * All errors thrown by the HTTP client conform to this shape,
 * making it easy to handle errors consistently in catch blocks.
 */
export interface HttpError {
  /**
   * Human-readable error message.
   * For HTTP errors, this is typically the server's error message.
   * For network errors, this describes the connectivity issue.
   */
  message: string;

  /**
   * HTTP status code.
   * `0` for network errors or timeouts where no response was received.
   */
  statusCode: number;

  /**
   * Validation errors keyed by field name.
   * Typically populated for 422 Unprocessable Entity responses.
   *
   * @example `{ email: ['Email is required', 'Email must be valid'] }`
   */
  errors?: Record<string, string[]>;

  /**
   * The full HTTP response, if one was received.
   * `undefined` for network errors where no response arrived.
   */
  response?: HttpResponse;

  /**
   * The original request configuration that caused the error.
   * Useful for retry logic and debugging.
   */
  config?: HttpRequestConfig;

  /**
   * Type guard discriminator.
   * Always `true` — allows `isHttpError` checks without `instanceof`.
   */
  isHttpError: true;
}

/**
 * @fileoverview Content-Type enumeration
 *
 * Common MIME types used in HTTP request and response headers.
 * Provides type-safe constants instead of raw strings.
 *
 * @module @stackra/ts-http
 * @category Enums
 *
 * @example
 * ```typescript
 * import { ContentType } from '@stackra/ts-http';
 *
 * const config: HttpRequestConfig = {
 *   url: '/api/users',
 *   headers: { 'Content-Type': ContentType.JSON },
 *   data: { name: 'John' },
 * };
 * ```
 */

export enum ContentType {
  /** JSON payload — `application/json`. */
  JSON = 'application/json',

  /** URL-encoded form data — `application/x-www-form-urlencoded`. */
  FORM_URLENCODED = 'application/x-www-form-urlencoded',

  /** Multipart form data (file uploads) — `multipart/form-data`. */
  MULTIPART_FORM_DATA = 'multipart/form-data',

  /** Plain text — `text/plain`. */
  TEXT = 'text/plain',

  /** HTML content — `text/html`. */
  HTML = 'text/html',

  /** XML content — `application/xml`. */
  XML = 'application/xml',

  /** Binary stream — `application/octet-stream`. */
  OCTET_STREAM = 'application/octet-stream',
}

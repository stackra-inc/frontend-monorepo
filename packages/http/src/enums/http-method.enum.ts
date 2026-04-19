/**
 * @fileoverview HTTP method enumeration
 *
 * Standard HTTP methods used by the HTTP client to specify
 * the type of request being made. Maps to the HTTP/1.1 spec.
 *
 * @module @stackra/ts-http
 * @category Enums
 *
 * @example
 * ```typescript
 * import { HttpMethod } from '@stackra/ts-http';
 *
 * const config: HttpRequestConfig = {
 *   url: '/api/users',
 *   method: HttpMethod.GET,
 * };
 * ```
 */

export enum HttpMethod {
  /** Retrieve a resource or collection. */
  GET = 'GET',

  /** Create a new resource. */
  POST = 'POST',

  /** Replace an existing resource entirely. */
  PUT = 'PUT',

  /** Partially update an existing resource. */
  PATCH = 'PATCH',

  /** Remove a resource. */
  DELETE = 'DELETE',

  /** Retrieve headers only (no body). */
  HEAD = 'HEAD',

  /** Describe communication options for the target resource. */
  OPTIONS = 'OPTIONS',
}

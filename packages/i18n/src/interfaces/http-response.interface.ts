/**
 * HTTP Response Interface (Local Mirror)
 *
 * Local definition of the HTTP response returned by the
 * `@stackra/ts-http` middleware pipeline. Defined here to avoid
 * a hard dependency on the HTTP package.
 *
 * Matches the `HttpResponse` interface from `@stackra/ts-http`.
 *
 * @module interfaces/http-response
 */

/**
 * HTTP response returned by the middleware pipeline.
 */
export interface HttpResponse {
  /** Response headers from the server. */
  headers?: Record<string, string>;

  /** Allow additional response properties. */
  [key: string]: any;
}

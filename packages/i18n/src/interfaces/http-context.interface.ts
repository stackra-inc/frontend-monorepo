/**
 * HTTP Context Interface (Local Mirror)
 *
 * Local definition of the HTTP context that flows through the
 * `@stackra/ts-http` middleware pipeline. Defined here to avoid
 * a hard dependency on the HTTP package while maintaining type safety.
 *
 * Matches the `HttpContext` interface from `@stackra/ts-http`.
 *
 * @module interfaces/http-context
 */

/**
 * Context object passed through the HTTP middleware pipeline.
 *
 * Each request creates a fresh context. Middleware can read/modify
 * the request config and attach arbitrary metadata for downstream
 * middleware to consume.
 */
export interface HttpContext {
  /**
   * The HTTP request configuration.
   *
   * Middleware can modify headers, params, data, meta, etc. before
   * the request is sent.
   */
  request: {
    /** Request headers. */
    headers?: Record<string, string>;

    /** Request metadata for inter-middleware communication. */
    meta?: Record<string, any>;

    /** Allow additional request properties. */
    [key: string]: any;
  };

  /**
   * Shared metadata map for inter-middleware communication.
   *
   * Use this to pass data between middleware stages without
   * polluting the request config.
   */
  metadata: Map<string, any>;
}

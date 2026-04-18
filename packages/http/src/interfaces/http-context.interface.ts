/**
 * @fileoverview HTTP context interface
 *
 * The context object that flows through the middleware pipeline.
 * Contains the request configuration and a metadata map that
 * middleware can use to share data between pipeline stages.
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import type { HttpContext, HttpMiddlewareInterface } from '@stackra/ts-http';
 *
 * class TimingMiddleware implements HttpMiddlewareInterface {
 *   async handle(context: HttpContext, next: HttpNextFunction) {
 *     // Store start time in metadata for later middleware to read
 *     context.metadata.set('startTime', Date.now());
 *
 *     const response = await next(context);
 *
 *     const duration = Date.now() - context.metadata.get('startTime');
 *     console.log(`Request took ${duration}ms`);
 *
 *     return response;
 *   }
 * }
 * ```
 */

import type { HttpRequestConfig } from './http-request.interface';

/**
 * Context object passed through the middleware pipeline.
 *
 * Each request creates a fresh context. Middleware can read/modify
 * the request config and attach arbitrary metadata for downstream
 * middleware to consume.
 */
export interface HttpContext {
  /**
   * The HTTP request configuration.
   * Middleware can modify headers, params, data, etc. before
   * the request is sent.
   */
  request: HttpRequestConfig;

  /**
   * Shared metadata map for inter-middleware communication.
   * Use this to pass data between middleware stages without
   * polluting the request config.
   *
   * @example
   * ```typescript
   * // AuthMiddleware sets the token
   * context.metadata.set('authToken', 'Bearer xxx');
   *
   * // LoggingMiddleware reads timing info
   * context.metadata.get('startTime');
   * ```
   */
  metadata: Map<string, any>;
}

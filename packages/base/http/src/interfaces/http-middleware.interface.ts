/**
 * @fileoverview HTTP middleware interface
 *
 * Contract for HTTP middleware classes. Each middleware intercepts
 * requests flowing through the pipeline, can modify the context,
 * and must call `next()` to pass control to the next middleware
 * or the final HTTP adapter.
 *
 * Mirrors Laravel's middleware pattern adapted for HTTP requests.
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import { Injectable } from '@stackra/ts-container';
 * import type {
 *   HttpMiddlewareInterface,
 *   HttpNextFunction,
 *   HttpContext,
 *   HttpResponse,
 * } from '@stackra/ts-http';
 *
 * @Injectable()
 * class TimingMiddleware implements HttpMiddlewareInterface {
 *   async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
 *     const start = Date.now();
 *     const response = await next(context);
 *     console.log(`Request took ${Date.now() - start}ms`);
 *     return response;
 *   }
 * }
 * ```
 */

import type { HttpContext } from './http-context.interface';
import type { HttpResponse } from './http-response.interface';

/**
 * Interface for HTTP middleware classes.
 *
 * Each middleware has a `handle()` method that receives the request
 * context and a `next` function to call the next middleware in the
 * chain. The last middleware's `next()` calls the actual HTTP adapter.
 */
export interface HttpMiddlewareInterface {
  /*
  |--------------------------------------------------------------------------
  | handle
  |--------------------------------------------------------------------------
  |
  | Process the HTTP context and call next() to pass it downstream.
  | Return the response from next() or short-circuit by returning
  | early (e.g. for auth failures, cached responses).
  |
  */

  /**
   * Process the HTTP request through this middleware.
   *
   * @param context - The request context flowing through the pipeline.
   * @param next    - Call this to pass the context to the next middleware.
   * @returns The HTTP response from downstream middleware or the adapter.
   */
  handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse>;
}

/**
 * Function signature for calling the next middleware in the pipeline.
 *
 * Accepts the (possibly modified) context and returns the response
 * from the next middleware or the final HTTP adapter.
 */
export type HttpNextFunction = (context: HttpContext) => Promise<HttpResponse>;

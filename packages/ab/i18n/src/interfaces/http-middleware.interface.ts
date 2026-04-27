/**
 * HTTP Middleware Interface (Local Mirror)
 *
 * Local definition of the HTTP middleware contract from
 * `@stackra/ts-http`. Defined here to avoid a hard dependency
 * on the HTTP package.
 *
 * @module interfaces/http-middleware
 */

import type { HttpContext } from "./http-context.interface";
import type { HttpResponse } from "./http-response.interface";

/**
 * Interface for HTTP middleware classes.
 *
 * Each middleware has a `handle()` method that receives the request
 * context and a `next` function to call the next middleware in the
 * chain.
 */
export interface IHttpMiddleware {
  /**
   * Process the HTTP request through this middleware.
   *
   * @param context - The request context flowing through the pipeline
   * @param next - Call this to pass the context to the next middleware
   * @returns The HTTP response from downstream middleware or the adapter
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

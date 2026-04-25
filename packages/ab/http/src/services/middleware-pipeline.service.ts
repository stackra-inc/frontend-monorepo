/**
 * Middleware Pipeline
 *
 * Chains HTTP middleware in priority order and executes them as a
 * pipeline. The last middleware in the chain calls the final handler
 * (the actual HTTP adapter — axios).
 *
 * Mirrors Laravel's Pipeline pattern adapted for async HTTP requests.
 *
 * ## Pipeline Flow
 *
 * ```
 * Request → Middleware[0] → Middleware[1] → ... → Middleware[N] → axiosHandler → Response
 * ```
 *
 * Each middleware calls `next(context)` to pass control downstream.
 * The response bubbles back up through the chain in reverse order.
 *
 * @module @stackra/ts-http
 * @category Services
 *
 * @example
 * ```typescript
 * import { MiddlewarePipeline } from '@stackra/ts-http';
 *
 * const pipeline = new MiddlewarePipeline(registry);
 *
 * const response = await pipeline.execute(context, async (ctx) => {
 *   // Final handler — calls axios
 *   return axios.request(ctx.request);
 * });
 * ```
 */

import { Injectable, Inject } from '@stackra/ts-container';
import { MIDDLEWARE_REGISTRY } from '@/constants';
import { MiddlewareRegistry } from '@/registries/middleware.registry';
import type { HttpContext } from '@/interfaces/http-context.interface';
import type { HttpResponse } from '@/interfaces/http-response.interface';
import type { HttpNextFunction } from '@/interfaces/http-middleware.interface';

/**
 * Middleware Pipeline Service
 *
 * Builds and executes the middleware chain for each HTTP request.
 * Middleware are retrieved from the {@link MiddlewareRegistry} in
 * priority order (ascending) and chained via `reduceRight`.
 */
@Injectable()
export class MiddlewarePipeline {
  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  constructor(@Inject(MIDDLEWARE_REGISTRY) private readonly registry: MiddlewareRegistry) {}

  /*
  |--------------------------------------------------------------------------
  | execute
  |--------------------------------------------------------------------------
  |
  | Build the middleware chain and run the context through it.
  | The finalHandler is the last function in the chain — it calls
  | the actual HTTP adapter (axios).
  |
  */

  /**
   * Execute the middleware pipeline for a request.
   *
   * Builds a chain of `next()` functions from the sorted middleware list.
   * The final `next()` calls the HTTP adapter (axios).
   *
   * @param context      - The HTTP context containing the request config and metadata.
   * @param finalHandler - The terminal handler that performs the actual HTTP call.
   * @returns The HTTP response after flowing through all middleware.
   */
  async execute(context: HttpContext, finalHandler: HttpNextFunction): Promise<HttpResponse> {
    // Get middleware sorted by priority (ascending — lowest runs first).
    const middlewares = this.registry.getSorted();

    // Build the pipeline from right to left so the first middleware
    // in the sorted array is the outermost (first to execute).
    const pipeline = middlewares.reduceRight<HttpNextFunction>((next, middleware) => {
      return async (ctx: HttpContext) => {
        return middleware.handle(ctx, next);
      };
    }, finalHandler);

    // Run the context through the pipeline.
    return pipeline(context);
  }
}

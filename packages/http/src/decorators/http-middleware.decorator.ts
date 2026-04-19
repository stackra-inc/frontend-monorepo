/**
 * @HttpMiddleware Decorator
 *
 * Marks a class as an HTTP middleware and stores priority/name metadata.
 * The {@link HttpModule} discovers these decorated classes and registers
 * them in the {@link MiddlewareRegistry} sorted by priority.
 *
 * Lower priority values run first in the pipeline.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module @stackra/ts-http
 * @category Decorators
 *
 * @example
 * ```typescript
 * import { Injectable } from '@stackra/ts-container';
 * import { HttpMiddleware } from '@stackra/ts-http';
 * import type { HttpMiddlewareInterface, HttpNextFunction, HttpContext, HttpResponse } from '@stackra/ts-http';
 *
 * @HttpMiddleware({ priority: 10, name: 'auth' })
 * @Injectable()
 * class AuthMiddleware implements HttpMiddlewareInterface {
 *   async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
 *     context.request.headers = {
 *       ...context.request.headers,
 *       Authorization: 'Bearer token',
 *     };
 *     return next(context);
 *   }
 * }
 * ```
 */

import { defineMetadata, getMetadata } from '@vivtel/metadata';
import { HTTP_MIDDLEWARE_METADATA } from '@/constants';

/**
 * Configuration options for the `@HttpMiddleware()` decorator.
 */
export interface HttpMiddlewareOptions {
  /**
   * Execution priority — lower values run first in the pipeline.
   *
   * @default 50
   */
  priority?: number;

  /**
   * Optional human-readable name for debugging and logging.
   * Defaults to the class name if not provided.
   */
  name?: string;
}

/**
 * Decorator that marks a class as an HTTP middleware.
 *
 * @param options - Optional priority and name configuration.
 * @returns A class decorator.
 */
export function HttpMiddleware(options: HttpMiddlewareOptions = {}): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    defineMetadata(
      HTTP_MIDDLEWARE_METADATA,
      {
        priority: options.priority ?? 50,
        name: options.name ?? target.name,
      },
      target as object
    );
  };
}

/**
 * Retrieve the `@HttpMiddleware()` metadata from a decorated class.
 *
 * @param target - The class to inspect.
 * @returns The middleware options, or `undefined` if the class is not decorated.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getHttpMiddlewareMetadata(target: Function): HttpMiddlewareOptions | undefined {
  return getMetadata<HttpMiddlewareOptions>(HTTP_MIDDLEWARE_METADATA, target as object);
}

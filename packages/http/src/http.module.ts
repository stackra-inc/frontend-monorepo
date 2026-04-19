/**
 * HTTP Module
 *
 * Configures the HTTP client for dependency injection.
 * Registers the HttpClient, MiddlewarePipeline, MiddlewareRegistry,
 * and discovers `@HttpMiddleware()` decorated classes from providers.
 *
 * Follows the standard module pattern used by events, cache, and bus.
 *
 * @module @stackra/ts-http
 * @category Module
 *
 * @example
 * ```typescript
 * import { Module } from '@stackra/ts-container';
 * import { HttpModule } from '@stackra/ts-http';
 *
 * @Module({
 *   imports: [
 *     HttpModule.forRoot({
 *       baseURL: 'https://api.example.com/v1',
 *       timeout: 10000,
 *       headers: {
 *         'Accept': 'application/json',
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // With custom middleware and token provider:
 * @Module({
 *   imports: [
 *     HttpModule.forRoot({
 *       baseURL: 'https://api.example.com',
 *     }),
 *   ],
 *   providers: [
 *     { provide: TOKEN_PROVIDER, useClass: JwtTokenProvider },
 *     CustomCacheMiddleware,
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { Module, type DynamicModule } from '@stackra/ts-container';

import { HTTP_CLIENT, HTTP_CONFIG, MIDDLEWARE_PIPELINE, MIDDLEWARE_REGISTRY } from '@/constants';
import type { HttpClientConfig } from '@/interfaces/http-config.interface';
import { HttpClient } from '@/services/http-client.service';
import { MiddlewarePipeline } from '@/services/middleware-pipeline.service';
import { MiddlewareRegistry } from '@/registries/middleware.registry';

/**
 * HTTP Module
 *
 * Provides the HttpClient and middleware infrastructure to the application.
 *
 * **Auto-discovery**: any class in the module's `providers` array that is
 * decorated with `@HttpMiddleware()` is automatically registered in the
 * MiddlewareRegistry with its configured priority.
 */
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module pattern requires static methods
export class HttpModule {
  /*
  |--------------------------------------------------------------------------
  | forRoot
  |--------------------------------------------------------------------------
  |
  | Configure the HTTP client at the root level.
  | Registers all core services as global singletons.
  |
  */

  /**
   * Configure the HTTP module at the root level.
   *
   * Registers:
   * - `HTTP_CONFIG` — the raw configuration object
   * - `MiddlewareRegistry` — stores middleware sorted by priority
   * - `MIDDLEWARE_REGISTRY` — alias to MiddlewareRegistry
   * - `MiddlewarePipeline` — chains middleware for execution
   * - `MIDDLEWARE_PIPELINE` — alias to MiddlewarePipeline
   * - `HttpClient` — the main HTTP client service
   * - `HTTP_CLIENT` — alias to HttpClient
   *
   * @param config - Global HTTP client configuration.
   * @returns A dynamic module with global providers.
   */
  static forRoot(config: HttpClientConfig = {}): DynamicModule {
    return {
      module: HttpModule,
      global: true,
      providers: [
        // Configuration
        { provide: HTTP_CONFIG, useValue: config },

        // Registry
        { provide: MiddlewareRegistry, useClass: MiddlewareRegistry },
        { provide: MIDDLEWARE_REGISTRY, useExisting: MiddlewareRegistry },

        // Pipeline
        { provide: MiddlewarePipeline, useClass: MiddlewarePipeline },
        { provide: MIDDLEWARE_PIPELINE, useExisting: MiddlewarePipeline },

        // Client
        { provide: HttpClient, useClass: HttpClient },
        { provide: HTTP_CLIENT, useExisting: HttpClient },
      ],
      exports: [
        HttpClient,
        HTTP_CLIENT,
        HTTP_CONFIG,
        MiddlewarePipeline,
        MIDDLEWARE_PIPELINE,
        MiddlewareRegistry,
        MIDDLEWARE_REGISTRY,
      ],
    };
  }
}

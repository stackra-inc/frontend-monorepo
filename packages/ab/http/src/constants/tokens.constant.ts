/**
 * @fileoverview Injection tokens for the HTTP module
 *
 * Symbols used as service identifiers for dependency injection.
 * Follows the same pattern as events/bus/cache packages.
 *
 * Each token uniquely identifies a binding in the DI container,
 * allowing consumers to inject services by token rather than
 * concrete class reference.
 *
 * @module @stackra/ts-http
 * @category Constants
 *
 * @example
 * ```typescript
 * import { Inject } from '@stackra/ts-container';
 * import { HTTP_CLIENT, HTTP_CONFIG } from '@stackra/ts-http';
 *
 * @Injectable()
 * class ApiService {
 *   constructor(
 *     @Inject(HTTP_CLIENT) private http: HttpClientInterface,
 *     @Inject(HTTP_CONFIG) private config: HttpClientConfig,
 *   ) {}
 * }
 * ```
 */

/**
 * Injection token for the {@link HttpClient} service.
 * Resolves to the fully configured HTTP client with middleware pipeline.
 */
export const HTTP_CLIENT = Symbol.for('HTTP_CLIENT');

/**
 * Injection token for the HTTP module configuration object.
 * Resolves to the {@link HttpClientConfig} provided via `HttpModule.forRoot()`.
 */
export const HTTP_CONFIG = Symbol.for('HTTP_CONFIG');

/**
 * Injection token for the {@link MiddlewarePipeline} service.
 * Resolves to the pipeline that chains middleware in priority order.
 */
export const MIDDLEWARE_PIPELINE = Symbol.for('MIDDLEWARE_PIPELINE');

/**
 * Injection token for the {@link MiddlewareRegistry} service.
 * Resolves to the registry that stores middleware sorted by priority.
 */
export const MIDDLEWARE_REGISTRY = Symbol.for('MIDDLEWARE_REGISTRY');

/**
 * Metadata key for the `@HttpMiddleware()` decorator.
 * Stores priority and name metadata on decorated middleware classes.
 */
export const HTTP_MIDDLEWARE_METADATA = Symbol.for('HTTP_MIDDLEWARE_METADATA');

/**
 * Injection token for the token provider service.
 * Resolves to a class that provides authentication tokens for the AuthMiddleware.
 */
export const TOKEN_PROVIDER = Symbol.for('TOKEN_PROVIDER');

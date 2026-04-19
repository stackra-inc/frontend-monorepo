/**
 * @stackra/ts-http
 *
 * Middleware-driven HTTP client for TypeScript.
 * Axios underneath, decorator-based middleware registration,
 * and DI integration via @stackra/ts-container.
 *
 * @example
 * ```typescript
 * // Module setup
 * @Module({
 *   imports: [
 *     HttpModule.forRoot({
 *       baseURL: 'https://api.example.com/v1',
 *       timeout: 10000,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Inject and use the HTTP client
 * @Injectable()
 * class UserService {
 *   constructor(@Inject(HTTP_CLIENT) private http: HttpClient) {}
 *
 *   async getUsers() {
 *     return this.http.get<User[]>('/users');
 *   }
 * }
 * ```
 *
 * @module @stackra/ts-http
 */

import 'reflect-metadata';

// ============================================================================
// Constants
// ============================================================================
export {
  HTTP_CLIENT,
  HTTP_CONFIG,
  MIDDLEWARE_PIPELINE,
  MIDDLEWARE_REGISTRY,
  HTTP_MIDDLEWARE_METADATA,
  TOKEN_PROVIDER,
} from './constants';

// ============================================================================
// Enums
// ============================================================================
export { HttpMethod } from './enums';
export { ContentType } from './enums';

// ============================================================================
// Interfaces
// ============================================================================
export type {
  HttpClientConfig,
  HttpContext,
  HttpError,
  HttpMiddlewareInterface,
  HttpNextFunction,
  HttpRequestConfig,
  HttpResponse,
  TokenProviderInterface,
} from './interfaces';

// ============================================================================
// Types
// ============================================================================
export type { HttpMiddlewareClass } from './types';

// ============================================================================
// Decorators
// ============================================================================
export { HttpMiddleware, getHttpMiddlewareMetadata } from './decorators';
export type { HttpMiddlewareOptions } from './decorators';

// ============================================================================
// Registries
// ============================================================================
export { MiddlewareRegistry, middlewareRegistry } from './registries';

// ============================================================================
// Services
// ============================================================================
export { HttpClient } from './services';
export { MiddlewarePipeline } from './services';

// ============================================================================
// Middleware
// ============================================================================
export { AuthMiddleware } from './middleware';
export { ErrorNormalizerMiddleware } from './middleware';
export { LoggingMiddleware } from './middleware';
export { RetryMiddleware } from './middleware';

// ============================================================================
// Module
// ============================================================================
export { HttpModule } from './http.module';

// ============================================================================
// Facades
// ============================================================================
export { HttpFacade } from './facades';

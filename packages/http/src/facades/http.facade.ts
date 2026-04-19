/**
 * Http Facade
 *
 * Typed proxy for {@link HttpClient} from `@stackra/ts-http`.
 *
 * Middleware-driven HTTP client. Runs requests through a configurable pipeline.
 *
 * The facade is a module-level constant typed as `HttpClient`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra/ts-container';
 * import { Facade } from '@stackra/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { HttpFacade } from '@stackra/ts-http';
 *
 * // Full autocomplete — no .proxy() call needed
 * HttpFacade.get<T>();
 * ```
 *
 * ## Available methods (from {@link HttpClient})
 *
 * - `get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
 * - `post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
 * - `put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
 * - `patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
 * - `delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra/ts-support';
 * import { HTTP_CLIENT } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(HTTP_CLIENT, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/http
 * @see {@link HttpClient} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra/ts-support';
import { HttpClient } from '@/services/http-client.service';
import { HTTP_CLIENT } from '@/constants/tokens.constant';

/**
 * HttpFacade — typed proxy for {@link HttpClient}.
 *
 * Resolves `HttpClient` from the DI container via the `HTTP_CLIENT` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * HttpFacade.get<T>();
 * ```
 */
export const HttpFacade: HttpClient = Facade.make<HttpClient>(HTTP_CLIENT);

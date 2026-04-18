/**
 * Logging Middleware
 *
 * Logs HTTP request method, URL, duration, and response status code.
 * Only active in development mode (`import.meta.env.NODE_ENV !== 'production'`).
 *
 * Runs late in the pipeline (priority 90) so it captures the final
 * request state after all other middleware have processed it.
 *
 * @module @stackra/ts-http
 * @category Middleware
 *
 * @example
 * ```typescript
 * // In development, console output:
 * // [HTTP] GET /api/users → 200 (142ms)
 * // [HTTP] POST /api/users → 201 (89ms)
 * // [HTTP] GET /api/missing → 404 (23ms)
 * ```
 */

import { Str } from '@stackra/ts-support';
import { Injectable } from '@stackra/ts-container';
import { HttpMiddleware } from '@/decorators/http-middleware.decorator';
import type {
  HttpMiddlewareInterface,
  HttpNextFunction,
} from '@/interfaces/http-middleware.interface';
import type { HttpContext } from '@/interfaces/http-context.interface';
import type { HttpResponse } from '@/interfaces/http-response.interface';

/**
 * Logging Middleware
 *
 * Priority 90 — runs near the end of the pipeline to capture
 * the final request/response state for logging.
 */
@HttpMiddleware({ priority: 90, name: 'logging' })
@Injectable()
export class LoggingMiddleware implements HttpMiddlewareInterface {
  /*
  |--------------------------------------------------------------------------
  | handle
  |--------------------------------------------------------------------------
  |
  | Records the start time, calls next(), then logs the request details
  | with the response status and duration.
  |
  */

  /**
   * Log the HTTP request and response details.
   *
   * @param context - The HTTP context flowing through the pipeline.
   * @param next    - The next middleware in the chain.
   * @returns The HTTP response (unmodified).
   */
  async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
    // Skip logging in production.
    if (this.isProduction()) {
      return next(context);
    }

    const { method, url, baseURL } = context.request;
    const fullUrl = this.buildFullUrl(baseURL, url);
    const startTime = Date.now();

    try {
      const response = await next(context);
      const duration = Date.now() - startTime;

      // Log successful requests.
      console.log(`[HTTP] ${method ?? 'GET'} ${fullUrl} → ${response.status} (${duration}ms)`);

      return response;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const statusCode = this.extractStatusCode(error);

      // Log failed requests.
      console.error(`[HTTP] ${method ?? 'GET'} ${fullUrl} → ${statusCode} (${duration}ms)`);

      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — isProduction
  |--------------------------------------------------------------------------
  */

  /**
   * Check if the current environment is production.
   *
   * @returns `true` if NODE_ENV is 'production'.
   */
  private isProduction(): boolean {
    return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — buildFullUrl
  |--------------------------------------------------------------------------
  */

  /**
   * Combine baseURL and path into a display-friendly URL.
   *
   * @param baseURL - The base URL prefix.
   * @param url     - The request path.
   * @returns The combined URL string.
   */
  private buildFullUrl(baseURL?: string, url?: string): string {
    if (!baseURL) return url ?? '/';
    if (!url) return baseURL;
    return `${Str.finish(baseURL.replace(/\/$/, ''), '/')}${Str.chopStart(url, '/')}`;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — extractStatusCode
  |--------------------------------------------------------------------------
  */

  /**
   * Extract the status code from an error object.
   *
   * @param error - The error to inspect.
   * @returns The status code, or 0 for unknown errors.
   */
  private extractStatusCode(error: unknown): number {
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      return (error as Record<string, any>).statusCode as number;
    }
    return 0;
  }
}

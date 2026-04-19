/**
 * Retry Middleware
 *
 * Retries failed requests on 5xx server errors with exponential
 * backoff. Configurable via request metadata or constructor defaults.
 *
 * Only retries on server errors (status 500–599) and network errors
 * (status 0). Client errors (4xx) are never retried.
 *
 * @module @stackra/ts-http
 * @category Middleware
 *
 * @example
 * ```typescript
 * // Default: 3 retries with [1000, 2000, 4000]ms backoff
 * await http.get('/api/flaky-endpoint');
 *
 * // Override retry count per-request:
 * await http.get('/api/critical', {
 *   meta: { maxRetries: 5 },
 * });
 *
 * // Disable retries for a specific request:
 * await http.post('/api/idempotent', data, {
 *   meta: { maxRetries: 0 },
 * });
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { HttpMiddleware } from '@/decorators/http-middleware.decorator';
import type {
  HttpMiddlewareInterface,
  HttpNextFunction,
} from '@/interfaces/http-middleware.interface';
import type { HttpContext } from '@/interfaces/http-context.interface';
import type { HttpResponse } from '@/interfaces/http-response.interface';

/** Default maximum number of retry attempts. */
const DEFAULT_MAX_RETRIES = 3;

/** Default backoff delays in milliseconds for each retry attempt. */
const DEFAULT_BACKOFF = [1000, 2000, 4000];

/**
 * Retry Middleware
 *
 * Priority 20 — runs after auth but before logging so that
 * retried requests are properly authenticated and logged.
 */
@HttpMiddleware({ priority: 20, name: 'retry' })
@Injectable()
export class RetryMiddleware implements HttpMiddlewareInterface {
  /*
  |--------------------------------------------------------------------------
  | handle
  |--------------------------------------------------------------------------
  |
  | Attempts the request up to maxRetries times on retryable errors.
  | Uses exponential backoff between attempts.
  |
  */

  /**
   * Execute the request with retry logic.
   *
   * @param context - The HTTP context flowing through the pipeline.
   * @param next    - The next middleware in the chain.
   * @returns The HTTP response from a successful attempt.
   * @throws The last error if all retry attempts are exhausted.
   */
  async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
    const maxRetries = (context.request.meta?.maxRetries as number) ?? DEFAULT_MAX_RETRIES;
    const backoff = (context.request.meta?.retryBackoff as number[]) ?? DEFAULT_BACKOFF;

    let lastError: unknown;

    // Attempt the request up to maxRetries + 1 times (initial + retries).
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await next(context);
      } catch (error: unknown) {
        lastError = error;

        // Only retry on retryable errors (5xx, network errors).
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Don't wait after the last attempt — just throw.
        if (attempt < maxRetries) {
          const delay = backoff[attempt] ?? backoff[backoff.length - 1] ?? 1000;
          await this.sleep(delay);
        }
      }
    }

    // All attempts exhausted — throw the last error.
    throw lastError;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — isRetryable
  |--------------------------------------------------------------------------
  */

  /**
   * Determine if an error is retryable.
   *
   * Retryable errors are server errors (5xx) and network errors (status 0).
   * Client errors (4xx) are never retried.
   *
   * @param error - The error to inspect.
   * @returns `true` if the request should be retried.
   */
  private isRetryable(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;

    const statusCode = (error as Record<string, any>).statusCode as number | undefined;

    // Network errors (no response) — always retryable.
    if (statusCode === 0) return true;

    // Server errors (5xx) — retryable.
    if (statusCode !== undefined && statusCode >= 500 && statusCode < 600) return true;

    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — sleep
  |--------------------------------------------------------------------------
  */

  /**
   * Wait for a specified duration.
   *
   * @param ms - Duration in milliseconds.
   * @returns A promise that resolves after the delay.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

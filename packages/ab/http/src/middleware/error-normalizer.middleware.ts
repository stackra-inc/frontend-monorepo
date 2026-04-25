/**
 * Error Normalizer Middleware
 *
 * The outermost middleware in the pipeline (priority 5). Catches all
 * errors thrown by downstream middleware or the HTTP adapter and
 * normalizes them into consistent {@link HttpError} objects.
 *
 * Handles three error categories:
 * - **Network errors** — no response received (DNS failure, CORS, etc.)
 * - **Timeout errors** — request exceeded the configured timeout
 * - **API error responses** — server returned a non-2xx status code
 *
 * @module @stackra/ts-http
 * @category Middleware
 *
 * @example
 * ```typescript
 * import type { HttpError } from '@stackra/ts-http';
 *
 * try {
 *   await http.get('/api/users');
 * } catch (error) {
 *   const httpError = error as HttpError;
 *   console.log(httpError.statusCode);  // 500
 *   console.log(httpError.message);     // 'Internal Server Error'
 *   console.log(httpError.isHttpError); // true
 * }
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { AxiosError } from 'axios';
import { HttpMiddleware } from '@/decorators/http-middleware.decorator';
import type {
  HttpMiddlewareInterface,
  HttpNextFunction,
} from '@/interfaces/http-middleware.interface';
import type { HttpContext } from '@/interfaces/http-context.interface';
import type { HttpResponse } from '@/interfaces/http-response.interface';
import type { HttpError } from '@/interfaces/http-error.interface';

/**
 * Error Normalizer Middleware
 *
 * Wraps the entire pipeline in a try/catch and converts raw errors
 * (axios errors, network failures, timeouts) into a uniform
 * {@link HttpError} shape.
 */
@HttpMiddleware({ priority: 5, name: 'error-normalizer' })
@Injectable()
export class ErrorNormalizerMiddleware implements HttpMiddlewareInterface {
  /*
  |--------------------------------------------------------------------------
  | handle
  |--------------------------------------------------------------------------
  |
  | Wraps downstream execution in a try/catch. On error, inspects the
  | error type and builds a normalized HttpError object.
  |
  */

  /**
   * Process the request and normalize any errors.
   *
   * @param context - The HTTP context flowing through the pipeline.
   * @param next    - The next middleware in the chain.
   * @returns The HTTP response on success.
   * @throws {HttpError} A normalized error object on failure.
   */
  async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
    try {
      return await next(context);
    } catch (error: unknown) {
      throw this.normalizeError(error, context);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — normalizeError
  |--------------------------------------------------------------------------
  |
  | Inspects the raw error and builds the appropriate HttpError.
  |
  */

  /**
   * Convert a raw error into a normalized HttpError.
   *
   * @param error   - The raw error caught from the pipeline.
   * @param context - The original request context for debugging.
   * @returns A normalized HttpError object.
   */
  private normalizeError(error: unknown, context: HttpContext): HttpError {
    // Handle axios errors (most common case).
    if (error instanceof AxiosError) {
      return this.normalizeAxiosError(error, context);
    }

    // Handle errors that are already normalized (re-thrown from retry, etc.).
    if (this.isHttpError(error)) {
      return error;
    }

    // Handle unknown errors (unexpected exceptions).
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      message,
      statusCode: 0,
      config: context.request,
      isHttpError: true,
    };
  }

  /**
   * Normalize an AxiosError into an HttpError.
   *
   * @param error   - The axios error.
   * @param context - The original request context.
   * @returns A normalized HttpError.
   */
  private normalizeAxiosError(error: AxiosError, context: HttpContext): HttpError {
    // Timeout error — no response received.
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return {
        message: `Request timeout after ${context.request.timeout ?? 30000}ms`,
        statusCode: 0,
        config: context.request,
        isHttpError: true,
      };
    }

    // Network error — no response received (DNS, CORS, offline, etc.).
    if (!error.response) {
      return {
        message: error.message || 'Network error — no response received',
        statusCode: 0,
        config: context.request,
        isHttpError: true,
      };
    }

    // API error response — server returned a non-2xx status.
    const { response } = error;
    const responseData = response.data as Record<string, any> | undefined;

    return {
      message: responseData?.message || response.statusText || 'Request failed',
      statusCode: response.status,
      errors: responseData?.errors,
      response: {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config: context.request,
      },
      config: context.request,
      isHttpError: true,
    };
  }

  /**
   * Type guard to check if an error is already an HttpError.
   *
   * @param error - The error to check.
   * @returns `true` if the error conforms to the HttpError shape.
   */
  private isHttpError(error: unknown): error is HttpError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isHttpError' in error &&
      (error as HttpError).isHttpError === true
    );
  }
}

/**
 * Auth Middleware
 *
 * Injects Bearer authentication tokens into outgoing requests.
 * On 401 responses, attempts a single token refresh and retries
 * the request.
 *
 * Depends on a {@link TokenProviderInterface} implementation bound
 * to the `TOKEN_PROVIDER` injection token.
 *
 * Requests can opt out of auth by setting `meta.skipAuth: true`
 * in the request config.
 *
 * @module @stackra/ts-http
 * @category Middleware
 *
 * @example
 * ```typescript
 * // Requests automatically get Bearer tokens:
 * await http.get('/api/protected-resource');
 * // → Authorization: Bearer <token>
 *
 * // Skip auth for public endpoints:
 * await http.get('/api/public', { meta: { skipAuth: true } });
 * ```
 */

import { Injectable, Inject } from '@stackra/ts-container';
import { HttpMiddleware } from '@/decorators/http-middleware.decorator';
import { TOKEN_PROVIDER } from '@/constants';
import type { TokenProviderInterface } from '@/interfaces/token-provider.interface';
import type {
  HttpMiddlewareInterface,
  HttpNextFunction,
} from '@/interfaces/http-middleware.interface';
import type { HttpContext } from '@/interfaces/http-context.interface';
import type { HttpResponse } from '@/interfaces/http-response.interface';

/**
 * Auth Middleware
 *
 * Priority 10 — runs early in the pipeline to ensure the token
 * is attached before other middleware process the request.
 */
@HttpMiddleware({ priority: 10, name: 'auth' })
@Injectable()
export class AuthMiddleware implements HttpMiddlewareInterface {
  /*
  |--------------------------------------------------------------------------
  | Constructor
  |--------------------------------------------------------------------------
  */

  constructor(@Inject(TOKEN_PROVIDER) private readonly tokenProvider: TokenProviderInterface) {}

  /*
  |--------------------------------------------------------------------------
  | handle
  |--------------------------------------------------------------------------
  |
  | 1. Check if auth should be skipped (meta.skipAuth).
  | 2. Inject the Bearer token into the Authorization header.
  | 3. On 401 response: refresh the token and retry once.
  |
  */

  /**
   * Inject auth token and handle 401 refresh.
   *
   * @param context - The HTTP context flowing through the pipeline.
   * @param next    - The next middleware in the chain.
   * @returns The HTTP response.
   * @throws Re-throws if refresh fails or second attempt also fails.
   */
  async handle(context: HttpContext, next: HttpNextFunction): Promise<HttpResponse> {
    // Allow requests to opt out of authentication.
    if (context.request.meta?.skipAuth) {
      return next(context);
    }

    // Inject the current access token.
    await this.injectToken(context);

    try {
      return await next(context);
    } catch (error: unknown) {
      // Only attempt refresh on 401 Unauthorized responses.
      if (this.isUnauthorized(error)) {
        return this.handleUnauthorized(context, next);
      }

      // Re-throw all other errors.
      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — injectToken
  |--------------------------------------------------------------------------
  */

  /**
   * Attach the Bearer token to the request Authorization header.
   *
   * @param context - The HTTP context to modify.
   */
  private async injectToken(context: HttpContext): Promise<void> {
    const token = await this.tokenProvider.getAccessToken();

    if (token) {
      context.request.headers = {
        ...context.request.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — handleUnauthorized
  |--------------------------------------------------------------------------
  */

  /**
   * Refresh the token and retry the request once.
   *
   * @param context - The original request context.
   * @param next    - The next middleware function.
   * @returns The HTTP response from the retry.
   * @throws Re-throws if refresh or retry fails.
   */
  private async handleUnauthorized(
    context: HttpContext,
    next: HttpNextFunction
  ): Promise<HttpResponse> {
    // Attempt to refresh the token.
    const newToken = await this.tokenProvider.refresh();

    // Update the Authorization header with the new token.
    context.request.headers = {
      ...context.request.headers,
      Authorization: `Bearer ${newToken}`,
    };

    // Retry the request once with the refreshed token.
    return next(context);
  }

  /*
  |--------------------------------------------------------------------------
  | Internal — isUnauthorized
  |--------------------------------------------------------------------------
  */

  /**
   * Check if an error represents a 401 Unauthorized response.
   *
   * @param error - The error to inspect.
   * @returns `true` if the error has a 401 status code.
   */
  private isUnauthorized(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const statusCode = (error as Record<string, any>).statusCode;
    return statusCode === 401;
  }
}

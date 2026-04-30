/**
 * @fileoverview Token provider interface
 *
 * Contract for authentication token providers used by the
 * {@link AuthMiddleware}. Implementations handle token storage,
 * retrieval, expiration checks, and refresh logic.
 *
 * Consumers provide their own implementation and bind it to the
 * `TOKEN_PROVIDER` injection token.
 *
 * @module @stackra/ts-http
 * @category Interfaces
 *
 * @example
 * ```typescript
 * import { Injectable } from '@stackra/ts-container';
 * import type { TokenProviderInterface } from '@stackra/ts-http';
 *
 * @Injectable()
 * class JwtTokenProvider implements TokenProviderInterface {
 *   private token: string | null = null;
 *   private expiresAt = 0;
 *
 *   async getAccessToken(): Promise<string | null> {
 *     return this.token;
 *   }
 *
 *   async refresh(): Promise<string> {
 *     const res = await fetch('/auth/refresh', { method: 'POST' });
 *     const data = await res.json();
 *     this.token = data.accessToken;
 *     this.expiresAt = Date.now() + data.expiresIn * 1000;
 *     return this.token;
 *   }
 *
 *   isExpired(): boolean {
 *     return Date.now() >= this.expiresAt;
 *   }
 * }
 * ```
 */

/**
 * Interface for authentication token providers.
 *
 * The {@link AuthMiddleware} depends on this interface to inject
 * Bearer tokens into outgoing requests and handle token refresh
 * on 401 responses.
 */
export interface TokenProviderInterface {
  /**
   * Retrieve the current access token.
   *
   * @returns The access token string, or `null` if no token is available.
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Refresh the access token.
   *
   * Called by the AuthMiddleware when a 401 response is received.
   * Should obtain a new token from the auth server and store it.
   *
   * @returns The new access token string.
   * @throws Error if the refresh fails (e.g. refresh token expired).
   */
  refresh(): Promise<string>;

  /**
   * Check whether the current access token has expired.
   *
   * @returns `true` if the token is expired or unavailable.
   */
  isExpired(): boolean;
}

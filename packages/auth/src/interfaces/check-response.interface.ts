/**
 * @fileoverview Response shape for authentication checks.
 *
 * @module @stackra/react-auth
 * @category Interfaces
 */

/**
 * Response shape for authentication checks.
 */
export interface CheckResponse {
  /** Whether the user is currently authenticated. */
  authenticated: boolean;

  /** Optional URL to redirect unauthenticated users to. */
  redirectTo?: string;

  /** Whether the user should be logged out. */
  logout?: boolean;

  /** Optional error details. */
  error?: Error;
}

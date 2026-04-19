/**
 * @fileoverview Response shape for auth error handling.
 *
 * @module @stackra-inc/react-auth
 * @category Interfaces
 */

/**
 * Response shape for auth error handling.
 */
export interface OnErrorResponse {
  /** Optional URL to redirect to after the error. */
  redirectTo?: string;

  /** Whether the user should be logged out. */
  logout?: boolean;

  /** Optional error details. */
  error?: Error;
}

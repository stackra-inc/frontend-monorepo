/**
 * @fileoverview Response shape for authentication actions (login, logout).
 *
 * @module @stackra/react-auth
 * @category Interfaces
 */

/**
 * Response shape for auth actions (login, logout).
 */
export interface AuthActionResponse {
  /** Whether the action succeeded. */
  success: boolean;

  /** Optional URL to redirect to after the action. */
  redirectTo?: string;

  /** Optional error if the action failed. */
  error?: Error;

  /** Allow additional properties for custom auth flows. */
  [key: string]: any;
}

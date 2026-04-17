/**
 * @fileoverview Authentication service interface.
 *
 * Defines the contract for authentication operations including
 * login, logout, identity checks, and permission retrieval.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

import type { AuthActionResponse } from './auth-action-response.interface';
import type { CheckResponse } from './check-response.interface';
import type { OnErrorResponse } from './on-error-response.interface';

/**
 * Authentication service interface.
 *
 * Implementations handle login, logout, identity checks,
 * permission retrieval, and auth error handling.
 */
export interface IAuthService {
  /**
   * Authenticate a user.
   * @param params - Login credentials or parameters.
   * @returns Auth action response.
   */
  login(params: any): Promise<AuthActionResponse>;

  /**
   * Log out the current user.
   * @param params - Optional logout parameters.
   * @returns Auth action response.
   */
  logout(params?: any): Promise<AuthActionResponse>;

  /**
   * Check if the current user is authenticated.
   * @param params - Optional check parameters.
   * @returns Check response with authentication status.
   */
  check(params?: any): Promise<CheckResponse>;

  /**
   * Get the current user's identity.
   * @returns User identity object.
   */
  getIdentity(): Promise<any>;

  /**
   * Get the current user's permissions.
   * @returns Permissions object or array.
   */
  getPermissions(): Promise<any>;

  /**
   * Handle authentication errors.
   * @param error - The error that occurred.
   * @returns Error response with redirect/logout instructions.
   */
  onError(error: any): Promise<OnErrorResponse>;
}

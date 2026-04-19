/**
 * @fileoverview Authentication service interface.
 *
 * Defines the contract for authentication operations including
 * login, logout, registration, multi-factor challenge/verify,
 * password management, identity linking, and session retrieval.
 *
 * @module @stackra-inc/react-auth
 * @category Interfaces
 */

import type { AuthActionResponse } from './auth-action-response.interface';
import type { CheckResponse } from './check-response.interface';
import type { OnErrorResponse } from './on-error-response.interface';

/**
 * Authentication service interface.
 *
 * Implementations handle login, logout, registration, multi-factor
 * authentication, password management, identity provider linking,
 * identity checks, permission retrieval, and auth error handling.
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

  /**
   * Register a new user.
   * @param params - Registration parameters (e.g. email, password, name).
   * @returns Auth action response.
   */
  register(params: any): Promise<AuthActionResponse>;

  /**
   * Initiate a multi-factor or provider challenge.
   * @param provider - The authentication provider (e.g. 'totp', 'email_otp').
   * @param input - Optional additional input for the challenge.
   * @returns Challenge response (provider-specific).
   */
  challenge(provider: string, input?: Record<string, any>): Promise<any>;

  /**
   * Verify a multi-factor or provider challenge.
   * @param provider - The authentication provider.
   * @param input - Verification input (e.g. OTP code).
   * @returns Auth action response.
   */
  verify(provider: string, input?: Record<string, any>): Promise<AuthActionResponse>;

  /**
   * Request a password reset email.
   * @param email - The user's email address.
   * @returns Auth action response.
   */
  forgotPassword(email: string): Promise<AuthActionResponse>;

  /**
   * Reset the user's password using a reset token.
   * @param email - The user's email address.
   * @param token - The password reset token.
   * @param password - The new password.
   * @returns Auth action response.
   */
  resetPassword(email: string, token: string, password: string): Promise<AuthActionResponse>;

  /**
   * Update the current user's password.
   * @param currentPassword - The current password for verification.
   * @param password - The new password.
   * @returns Auth action response.
   */
  updatePassword(currentPassword: string, password: string): Promise<AuthActionResponse>;

  /**
   * Link an external identity provider to the current user.
   * @param provider - The provider to link (e.g. 'google', 'github').
   * @param input - Optional provider-specific input.
   * @returns Auth action response.
   */
  link(provider: string, input?: Record<string, any>): Promise<AuthActionResponse>;

  /**
   * Unlink an external identity provider from the current user.
   * @param provider - The provider to unlink.
   * @returns Auth action response.
   */
  unlink(provider: string): Promise<AuthActionResponse>;

  /**
   * Get the current session data (user, token, permissions, roles).
   * @returns Full session object.
   */
  getSession(): Promise<any>;
}

/**
 * @fileoverview DI tokens for the auth package.
 *
 * @module @stackra-inc/react-auth
 * @category Constants
 */

/** DI token for the {@link IAuthService} implementation. */
export const AUTH_SERVICE = Symbol.for('AUTH_SERVICE');

/** DI token for the {@link IAccessControlService} implementation. */
export const ACCESS_CONTROL_SERVICE = Symbol.for('ACCESS_CONTROL_SERVICE');

/** DI token for the {@link SessionService} implementation. */
export const SESSION_SERVICE = Symbol.for('SESSION_SERVICE');

/** DI token for the {@link SecurityService} implementation. */
export const SECURITY_SERVICE = Symbol.for('SECURITY_SERVICE');

// ─── Storage Keys ────────────────────────────────────────────────────

/** Storage key for persisting the authentication token. */
export const AUTH_TOKEN_KEY = 'auth_token';

/** Storage key for persisting the authenticated user identity. */
export const AUTH_USER_KEY = 'auth_user';

/** Storage key for persisting the current session. */
export const SESSION_STORAGE_KEY = 'auth_session';

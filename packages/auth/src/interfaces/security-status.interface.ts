/**
 * @fileoverview Security status type.
 *
 * Possible security statuses returned by the security check endpoint.
 *
 * @module @stackra/react-auth
 * @category Interfaces
 */

/**
 * Possible security statuses returned by the security check endpoint.
 */
export type SecurityStatus = 'ok' | 'locked' | 'device_limit' | 'force_password';

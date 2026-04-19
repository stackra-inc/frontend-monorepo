/**
 * Security Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for biometric auth, keychain, and screen lock services.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra-inc/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| Biometric Authentication
|--------------------------------------------------------------------------
*/

/** Result of a biometric authentication attempt. */
export interface BiometricResult {
  /** Whether authentication succeeded. */
  success: boolean;
  /** Error message if authentication failed. */
  error?: string;
}

/*
|--------------------------------------------------------------------------
| Lock / Idle Timeout
|--------------------------------------------------------------------------
*/

/** Configuration for the LockService. */
export interface LockConfig {
  /** Idle timeout in seconds before auto-lock. @default 300 */
  idleTimeout?: number;
}

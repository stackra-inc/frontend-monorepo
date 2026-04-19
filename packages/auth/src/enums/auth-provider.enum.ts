/**
 * @fileoverview Authentication provider enum.
 *
 * Enumerates the supported authentication providers / strategies.
 * Used when initiating challenge, verify, link, or unlink flows.
 *
 * @module @stackra-inc/react-auth
 * @category Enums
 *
 * @example
 * ```typescript
 * import { AuthProvider } from '@stackra-inc/react-auth';
 *
 * const { mutate: challenge } = useChallenge();
 * challenge({ provider: AuthProvider.Totp });
 * ```
 */

/**
 * Supported authentication providers / strategies.
 */
export enum AuthProvider {
  Email = 'email',
  StaffPin = 'staff_pin',
  ApiKey = 'api_key',
  Totp = 'totp',
  Google = 'google',
  Github = 'github',
  Phone = 'phone',
  EmailOtp = 'email_otp',
  MagicLink = 'magic_link',
  WebAuthn = 'webauthn',
}

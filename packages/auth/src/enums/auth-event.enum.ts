/**
 * @fileoverview Auth event names for the event dispatcher.
 *
 * These constants are used with `@stackra-inc/ts-events` to publish
 * lifecycle events from the {@link AuthService}, {@link SessionService},
 * and {@link SecurityService}. Consumers can listen to these events
 * via `EventService.listen()` or the `@OnEvent` decorator.
 *
 * @module @stackra-inc/react-auth
 * @category Enums
 *
 * @example
 * ```typescript
 * import { AuthEvent } from '@stackra-inc/react-auth';
 * import { useEvents } from '@stackra-inc/ts-events';
 *
 * const events = useEvents();
 * events.listen(AuthEvent.LoginSucceeded, (payload) => {
 *   console.log('User logged in:', payload.user);
 * });
 * ```
 */

/**
 * Enumeration of all auth-related event names.
 *
 * Follows the `domain.action` naming convention used by `ts-events`.
 */
export enum AuthEvent {
  // ─── Login ───────────────────────────────────────────────────────

  /** Fired when a login attempt starts. Payload: `{ params }`. */
  LoginAttempt = 'auth.login.attempt',

  /**
   * Fired after a successful login. Payload: `{ user, token }`.
   * @deprecated Use {@link LoginSucceeded} instead.
   */
  LoginSuccess = 'auth.login.success',

  /** Fired after a successful login. Payload: `{ user, token }`. */
  LoginSucceeded = 'auth.login.succeeded',

  /** Fired after a failed login. Payload: `{ error, params }`. */
  LoginFailed = 'auth.login.failed',

  /** Fired when a suspicious login is detected. Payload: `{ reason }`. */
  SuspiciousLoginDetected = 'auth.login.suspicious_detected',

  /** Fired when a high-risk login is detected. Payload: `{ reason }`. */
  HighRiskLoginDetected = 'auth.login.high_risk_detected',

  // ─── Logout ──────────────────────────────────────────────────────

  /** Fired when a logout is initiated. Payload: `{ userId }`. */
  LogoutAttempt = 'auth.logout.attempt',

  /**
   * Fired after a successful logout. Payload: `{ userId }`.
   * @deprecated Use {@link LogoutCompleted} instead.
   */
  LogoutSuccess = 'auth.logout.success',

  /** Fired after a successful logout. Payload: `{ userId }`. */
  LogoutCompleted = 'auth.logout.completed',

  // ─── Registration ────────────────────────────────────────────────

  /** Fired after a successful registration. Payload: `{ user }`. */
  RegistrationCompleted = 'auth.registration.completed',

  // ─── Token ───────────────────────────────────────────────────────

  /** Fired when the auth token is refreshed. Payload: `{ token }`. */
  TokenRefreshed = 'auth.token.refreshed',

  /** Fired when the auth token expires or is revoked. */
  TokenExpired = 'auth.token.expired',

  // ─── Identity ────────────────────────────────────────────────────

  /** Fired when the user identity is fetched. Payload: `{ user }`. */
  IdentityLoaded = 'auth.identity.loaded',

  /** Fired when permissions are fetched. Payload: `{ permissions }`. */
  PermissionsLoaded = 'auth.permissions.loaded',

  /** Fired when an identity provider is linked. Payload: `{ provider }`. */
  IdentityLinked = 'auth.identity.linked',

  /** Fired when an identity provider is unlinked. Payload: `{ provider }`. */
  IdentityUnlinked = 'auth.identity.unlinked',

  /** Fired when identity linking fails. Payload: `{ provider, error }`. */
  IdentityLinkingFailed = 'auth.identity.linking_failed',

  /** Fired when identity linking requires approval. Payload: `{ provider }`. */
  IdentityLinkingRequiresApproval = 'auth.identity.linking_requires_approval',

  // ─── Session ─────────────────────────────────────────────────────

  /** Fired when a new session is created. Payload: `{ session }`. */
  SessionCreated = 'auth.session.created',

  /** Fired when a session is destroyed. Payload: `{ sessionId }`. */
  SessionDestroyed = 'auth.session.destroyed',

  /** Fired when a session is refreshed/extended. Payload: `{ session }`. */
  SessionRefreshed = 'auth.session.refreshed',

  // ─── Device / Security ───────────────────────────────────────────

  /** Fired when a new device is registered. Payload: `{ device }`. */
  DeviceRegistered = 'auth.device.registered',

  /** Fired when a device is force-logged out. Payload: `{ deviceId }`. */
  DeviceRevoked = 'auth.device.revoked',

  /** Fired when a new device is detected. Payload: `{ device }`. */
  NewDeviceDetected = 'auth.device.new_detected',

  /** Fired when the account is locked. Payload: `{ reason, retryAfter }`. */
  AccountLocked = 'auth.account.locked',

  /** Fired when the account is unlocked. */
  AccountUnlocked = 'auth.account.unlocked',

  // ─── Password ────────────────────────────────────────────────────

  /** Fired when a password change is requested. */
  PasswordChangeRequested = 'auth.password.change_requested',

  /** Fired after a successful password change. */
  PasswordChanged = 'auth.password.changed',

  // ─── Email Verification ──────────────────────────────────────────

  /** Fired when email verification is requested. Payload: `{ email }`. */
  EmailVerificationRequested = 'auth.email.verification_requested',

  /** Fired when email verification is completed. Payload: `{ email }`. */
  EmailVerificationCompleted = 'auth.email.verification_completed',

  // ─── Verification ────────────────────────────────────────────────

  /** Fired when a verification is requested. Payload: `{ provider }`. */
  VerificationRequested = 'auth.verification.requested',

  /** Fired when a verification is completed. Payload: `{ provider }`. */
  VerificationCompleted = 'auth.verification.completed',

  /** Fired when a verification fails. Payload: `{ provider, error }`. */
  VerificationFailed = 'auth.verification.failed',

  // ─── OTP / Magic Link ────────────────────────────────────────────

  /** Fired when an OTP send is requested. Payload: `{ provider }`. */
  OtpSendRequested = 'auth.otp.send_requested',

  /** Fired when a magic link send is requested. Payload: `{ email }`. */
  MagicLinkSendRequested = 'auth.magic_link.send_requested',
}

# Requirements Document

## Introduction

This feature adds backend session and device management to the PHP auth module
and aligns the frontend `@stackra/react-refine` package with the real backend
API contract. The backend currently uses Sanctum tokens as sessions but provides
no way to list, manage, or revoke them. Device fingerprints are captured but not
exposed via API. The frontend services (`AuthService`, `SessionService`,
`SecurityService`) call endpoints that do not exist and miss provider-aware auth
flows (challenge/verify, identity linking, password management). This spec
covers creating the `user_sessions` table and API endpoints on the backend, then
rewriting the frontend services and adding missing hooks to match.

## Glossary

- **Backend**: The PHP monorepo auth module at `modules/auth`, using Laravel
  Sanctum for token-based authentication.
- **Frontend**: The `@stackra/react-refine` TypeScript/React package that
  provides hooks and services for auth, sessions, security, and device
  management.
- **Sanctum_Token**: A Laravel Sanctum personal access token stored in the
  `personal_access_tokens` table, used as the authentication bearer token.
- **User_Session**: A server-side record linking a Sanctum_Token to device
  fingerprint, IP address, user agent, and activity timestamps, stored in the
  `user_sessions` table.
- **Device_Fingerprint**: A JSON object capturing browser/device characteristics
  (user agent, screen resolution, timezone, language) used to identify a
  physical device across sessions.
- **Auth_Provider**: One of 10 authentication strategies supported by the
  backend: `email`, `staff_pin`, `api_key`, `totp` (single-step), `google`,
  `github`, `phone`, `email_otp`, `magic_link`, `webauthn` (multi-step via
  challenge/verify).
- **Challenge_Verify_Flow**: A two-step authentication flow where
  `POST auth/challenge` initiates the process (e.g. OAuth redirect, OTP send)
  and `POST auth/verify` completes it (e.g. OAuth callback, OTP code
  submission).
- **Identity_Linking**: The ability to link or unlink additional Auth_Providers
  to an existing user account via `POST auth/link` and
  `DELETE auth/unlink/{provider}`.
- **AuthSessionResource**: The Laravel API resource that formats `GET auth/me`
  responses as `{ user, token, permissions, roles }`.
- **UserSessionResource**: The Laravel API resource that formats User_Session
  records for API responses.
- **SecurityCheckResult**: The response shape from `GET auth/security/check`
  containing status (`ok`, `locked`, `device_limit`, `force_password`), optional
  message, retryAfter, and activeDevices.
- **IAuthService**: The TypeScript interface defining the frontend auth service
  contract.
- **SessionService**: The frontend service class that communicates with session
  management API endpoints.
- **SecurityService**: The frontend service class that communicates with
  security check and device management API endpoints.
- **Hook**: A React hook function wrapping a service method with TanStack React
  Query for declarative state management.
- **Setter_Function**: A module-level function that assigns a service instance
  to a module-scoped variable so hooks can access the service without DI.
- **RefineModule**: The DI module class providing `forRoot()` for global service
  configuration.
- **DeviceFingerprintService**: The existing backend PHP service that captures,
  stores, and compares device fingerprints.
- **SuspiciousLoginDetector**: The existing backend PHP service that detects new
  devices, new locations, and impossible travel.
- **LoginRiskScorer**: The existing backend PHP service that computes a weighted
  0.0–1.0 risk score per login attempt.

## Requirements

### Requirement 1: Backend User Sessions Table

**User Story:** As a backend developer, I want a `user_sessions` table that
links Sanctum tokens to device fingerprints and metadata, so that sessions can
be listed, managed, and revoked individually.

#### Acceptance Criteria

1. WHEN the migration is executed, THE Backend SHALL create a `user_sessions`
   table with columns: `id` (primary key), `user_id` (foreign key to users),
   `personal_access_token_id` (foreign key to personal_access_tokens),
   `device_fingerprint` (JSON), `ip_address` (string, nullable), `user_agent`
   (string, nullable), `last_active_at` (timestamp), `expires_at` (timestamp,
   nullable), `created_at` (timestamp), `updated_at` (timestamp).
2. WHEN a `user_sessions` row references a deleted user, THE Backend SHALL
   cascade-delete the session row.
3. WHEN a `user_sessions` row references a deleted personal_access_token, THE
   Backend SHALL cascade-delete the session row.
4. THE Backend SHALL define a `UserSession` Eloquent model with fillable
   attributes for `user_id`, `personal_access_token_id`, `device_fingerprint`,
   `ip_address`, `user_agent`, `last_active_at`, and `expires_at`.
5. THE `UserSession` model SHALL cast `device_fingerprint` to array and
   `last_active_at` and `expires_at` to datetime.

### Requirement 2: Backend Session Service

**User Story:** As a backend developer, I want a `SessionService` that manages
User_Session lifecycle, so that sessions are created on login, refreshed on
activity, and destroyed on logout.

#### Acceptance Criteria

1. WHEN a user successfully authenticates via any Auth_Provider, THE Backend
   SessionService SHALL create a User_Session record linking the new
   Sanctum_Token to the captured Device_Fingerprint, IP address, and user agent.
2. WHEN a user makes an authenticated API request, THE Backend SessionService
   SHALL update the `last_active_at` timestamp on the corresponding
   User_Session.
3. WHEN a user logs out via `POST auth/logout`, THE Backend SessionService SHALL
   delete the User_Session associated with the current Sanctum_Token and revoke
   the token.
4. WHEN `SessionService.listForUser(userId)` is called, THE Backend
   SessionService SHALL return all non-expired User_Session records for the
   specified user, ordered by `last_active_at` descending.
5. WHEN `SessionService.destroy(sessionId, userId)` is called, THE Backend
   SessionService SHALL delete the specified User_Session and revoke its
   associated Sanctum_Token, only if the session belongs to the specified user.
6. WHEN `SessionService.destroyAllExceptCurrent(userId, currentSessionId)` is
   called, THE Backend SessionService SHALL delete all User_Sessions for the
   user except the one with `currentSessionId`, and revoke their associated
   Sanctum_Tokens.

### Requirement 3: Backend Session API Endpoints

**User Story:** As a frontend developer, I want REST endpoints to list, inspect,
and revoke sessions, so that the frontend can build session management UIs.

#### Acceptance Criteria

1. WHEN an authenticated user sends `GET auth/sessions`, THE Backend SHALL
   return a JSON array of all active User_Sessions for the authenticated user,
   each formatted via UserSessionResource.
2. WHEN an authenticated user sends `GET auth/sessions/current`, THE Backend
   SHALL return the User_Session associated with the current Sanctum_Token,
   formatted via UserSessionResource.
3. WHEN an authenticated user sends `DELETE auth/sessions/{id}`, THE Backend
   SHALL destroy the specified User_Session only if it belongs to the
   authenticated user, and return a 200 response on success.
4. IF an authenticated user sends `DELETE auth/sessions/{id}` for a session that
   does not belong to the authenticated user, THEN THE Backend SHALL return a
   403 Forbidden response.
5. WHEN an authenticated user sends `DELETE auth/sessions` (no ID), THE Backend
   SHALL destroy all User_Sessions for the authenticated user except the current
   session, and return a 200 response with the count of destroyed sessions.
6. IF an unauthenticated request is sent to any session endpoint, THEN THE
   Backend SHALL return a 401 Unauthorized response.

### Requirement 4: Backend Device Management Endpoints

**User Story:** As a frontend developer, I want REST endpoints to list active
devices and revoke all sessions for a specific device, so that users can manage
their trusted devices.

#### Acceptance Criteria

1. WHEN an authenticated user sends `GET auth/devices`, THE Backend SHALL return
   a JSON array of unique devices derived from the user's active User_Sessions,
   grouped by Device_Fingerprint, including device name, last seen timestamp, IP
   address, and whether the device is the current one.
2. WHEN an authenticated user sends `DELETE auth/devices/{fingerprint}`, THE
   Backend SHALL destroy all User_Sessions for the authenticated user that match
   the specified Device_Fingerprint hash, and revoke their associated
   Sanctum_Tokens.
3. IF an authenticated user sends `DELETE auth/devices/{fingerprint}` for a
   fingerprint that matches the current session's device, THEN THE Backend SHALL
   destroy all other sessions for that device but preserve the current session.
4. IF an unauthenticated request is sent to any device endpoint, THEN THE
   Backend SHALL return a 401 Unauthorized response.

### Requirement 5: Backend Security Check Endpoint

**User Story:** As a frontend developer, I want a `GET auth/security/check`
endpoint that returns the user's account security status, so that the frontend
can display warnings and enforce security policies.

#### Acceptance Criteria

1. WHEN an authenticated user sends `GET auth/security/check`, THE Backend SHALL
   return a SecurityCheckResult containing the account status as one of: `ok`,
   `locked`, `device_limit`, `force_password`.
2. WHILE the user's account is locked, THE Backend SHALL return status `locked`
   with a `message` explaining the lock reason and `retryAfter` indicating
   seconds until automatic unlock.
3. WHILE the user has exceeded the maximum allowed device count, THE Backend
   SHALL return status `device_limit` with an `activeDevices` array listing all
   active devices.
4. WHILE the user has a pending forced password change, THE Backend SHALL return
   status `force_password` with a `message` indicating the password must be
   changed.
5. IF an unauthenticated request is sent to the security check endpoint, THEN
   THE Backend SHALL return a 401 Unauthorized response.

### Requirement 6: Backend Device Fingerprint Wiring

**User Story:** As a backend developer, I want the DeviceFingerprintService to
capture and store fingerprints on every login, so that device tracking is
automatic and consistent.

#### Acceptance Criteria

1. WHEN a user authenticates via any Auth_Provider, THE Backend AuthService
   SHALL invoke DeviceFingerprintService to capture the device fingerprint from
   the current request.
2. WHEN a User_Session is created, THE Backend SHALL store the captured
   Device_Fingerprint JSON in the `device_fingerprint` column of the
   `user_sessions` row.
3. WHEN the DeviceFingerprintService detects a new device (fingerprint not seen
   before for this user), THE Backend SHALL dispatch a `NewDeviceDetected`
   event.

### Requirement 7: Backend UserSessionResource

**User Story:** As a backend developer, I want a UserSessionResource API
resource that formats User_Session records consistently, so that all session
endpoints return the same shape.

#### Acceptance Criteria

1. THE UserSessionResource SHALL format a User_Session as a JSON object
   containing: `id`, `user_id`, `device_fingerprint`, `ip_address`,
   `user_agent`, `is_current` (boolean), `last_active_at` (ISO 8601),
   `expires_at` (ISO 8601 or null), `created_at` (ISO 8601).
2. WHEN the User_Session being formatted is the session associated with the
   current request's Sanctum_Token, THE UserSessionResource SHALL set
   `is_current` to `true`.
3. WHEN the User_Session being formatted is not the current session, THE
   UserSessionResource SHALL set `is_current` to `false`.

### Requirement 8: Frontend AuthService Rewrite

**User Story:** As a frontend developer, I want the AuthService to support all
10 backend Auth_Providers and all auth endpoints, so that the frontend can
handle single-step login, multi-step challenge/verify, registration, password
management, and identity linking.

#### Acceptance Criteria

1. THE Frontend AuthService SHALL expose a `login(params)` method that sends
   `POST /api/auth/login` with the provided params and returns an
   AuthActionResponse.
2. THE Frontend AuthService SHALL expose a `register(params)` method that sends
   `POST /api/auth/register` with the provided params and returns an
   AuthActionResponse containing `{ user, token }`.
3. THE Frontend AuthService SHALL expose a `challenge(provider, input)` method
   that sends `POST /api/auth/challenge` with `{ provider, input }` and returns
   the challenge response (e.g. OAuth redirect URL, OTP confirmation).
4. THE Frontend AuthService SHALL expose a `verify(provider, input)` method that
   sends `POST /api/auth/verify` with `{ provider, input }` and returns an
   AuthActionResponse containing `{ user, token, permissions, roles }`.
5. THE Frontend AuthService SHALL expose a `forgotPassword(email)` method that
   sends `POST /api/auth/forgot-password` with `{ email }` and returns an
   AuthActionResponse.
6. THE Frontend AuthService SHALL expose a
   `resetPassword(email, token, password)` method that sends
   `POST /api/auth/reset-password` with `{ email, token, password }` and returns
   an AuthActionResponse.
7. THE Frontend AuthService SHALL expose an
   `updatePassword(currentPassword, password)` method that sends
   `POST /api/auth/update-password` with `{ current_password, password }` and
   returns an AuthActionResponse.
8. THE Frontend AuthService SHALL expose a `link(provider, input)` method that
   sends `POST /api/auth/link` with `{ provider, input }` and returns an
   AuthActionResponse.
9. THE Frontend AuthService SHALL expose an `unlink(provider)` method that sends
   `DELETE /api/auth/unlink/{provider}` and returns an AuthActionResponse.
10. THE Frontend AuthService SHALL expose a `getIdentity()` method that sends
    `GET /api/auth/identity` and returns `{ identity, linked_providers }`.
11. THE Frontend AuthService SHALL update the `check()` method to send
    `GET /api/auth/check` and return `{ authenticated: boolean }`.
12. THE Frontend AuthService SHALL expose a `getSession()` method that sends
    `GET /api/auth/me` and returns `{ user, token, permissions, roles }` via
    AuthSessionResource.

### Requirement 9: Frontend IAuthService Interface Update

**User Story:** As a frontend developer, I want the IAuthService interface to
include all auth methods, so that custom auth service implementations have a
complete contract to follow.

#### Acceptance Criteria

1. THE IAuthService interface SHALL include method signatures for: `login`,
   `logout`, `check`, `getIdentity`, `getPermissions`, `onError`, `register`,
   `challenge`, `verify`, `forgotPassword`, `resetPassword`, `updatePassword`,
   `link`, `unlink`, `getSession`.
2. THE IAuthService interface SHALL type the `challenge` method as
   `challenge(provider: string, input?: Record<string, any>): Promise<any>`.
3. THE IAuthService interface SHALL type the `verify` method as
   `verify(provider: string, input?: Record<string, any>): Promise<AuthActionResponse>`.
4. THE IAuthService interface SHALL type the `link` method as
   `link(provider: string, input?: Record<string, any>): Promise<AuthActionResponse>`.
5. THE IAuthService interface SHALL type the `unlink` method as
   `unlink(provider: string): Promise<AuthActionResponse>`.

### Requirement 10: Frontend SessionService Rewrite

**User Story:** As a frontend developer, I want the SessionService to call the
real backend session endpoints, so that session management works against the
actual API.

#### Acceptance Criteria

1. THE Frontend SessionService SHALL update the `list()` method to send
   `GET /api/auth/sessions` and return an array of User_Session objects.
2. THE Frontend SessionService SHALL update the `getCurrent()` method to send
   `GET /api/auth/sessions/current` and return the current User_Session.
3. THE Frontend SessionService SHALL update the `destroy(sessionId)` method to
   send `DELETE /api/auth/sessions/{sessionId}`.
4. THE Frontend SessionService SHALL expose a `destroyAll()` method that sends
   `DELETE /api/auth/sessions` (no ID) to revoke all sessions except the current
   one.
5. THE Frontend SessionService SHALL remove the `create()` and `refresh()`
   methods, as session creation is handled by the backend login flow and
   sessions do not have a client-initiated refresh.
6. WHEN a session operation succeeds, THE Frontend SessionService SHALL dispatch
   the corresponding AuthEvent (`SessionDestroyed` for destroy,
   `SessionDestroyed` for destroyAll).

### Requirement 11: Frontend SecurityService Rewrite

**User Story:** As a frontend developer, I want the SecurityService to call the
real backend security and device endpoints, so that security checks and device
management work against the actual API.

#### Acceptance Criteria

1. THE Frontend SecurityService SHALL update the `check()` method to send
   `GET /api/auth/security/check` and return a SecurityCheckResult.
2. THE Frontend SecurityService SHALL update the `getActiveDevices()` method to
   send `GET /api/auth/devices` and return an array of ActiveDevice objects.
3. THE Frontend SecurityService SHALL update the `revokeDevice(fingerprint)`
   method to send `DELETE /api/auth/devices/{fingerprint}`.
4. THE Frontend SecurityService SHALL remove the `registerDevice()` method, as
   device registration is handled by the backend login flow via
   DeviceFingerprintService.
5. THE Frontend SecurityService SHALL remove the client-side `getDeviceId()`
   method and the `DEVICE_ID_KEY` localStorage key, as device identification is
   managed server-side.

### Requirement 12: Frontend AuthProvider Enum

**User Story:** As a frontend developer, I want an `AuthProvider` enum matching
the backend's 10 authentication strategies, so that provider values are
type-safe and consistent.

#### Acceptance Criteria

1. THE Frontend SHALL define an `AuthProvider` enum with values: `Email`,
   `StaffPin`, `ApiKey`, `Totp`, `Google`, `Github`, `Phone`, `EmailOtp`,
   `MagicLink`, `WebAuthn`.
2. THE `AuthProvider` enum values SHALL match the backend provider identifiers:
   `email`, `staff_pin`, `api_key`, `totp`, `google`, `github`, `phone`,
   `email_otp`, `magic_link`, `webauthn`.
3. THE `AuthProvider` enum SHALL be exported from the enums barrel
   (`src/enums/index.ts`).

### Requirement 13: Frontend AuthEvent Enum Update

**User Story:** As a frontend developer, I want the AuthEvent enum to include
all 20 backend event names, so that the frontend event system is aligned with
the backend.

#### Acceptance Criteria

1. THE Frontend AuthEvent enum SHALL include events for: `LoginFailed`,
   `LoginSucceeded`, `LogoutCompleted`, `RegistrationCompleted`,
   `PasswordChanged`, `PasswordResetRequested`, `NewDeviceDetected`,
   `SuspiciousLoginDetected`, `HighRiskLoginDetected`, `IdentityLinked`,
   `IdentityUnlinked`, `IdentityLinkingFailed`,
   `IdentityLinkingRequiresApproval`, `EmailVerificationRequested`,
   `EmailVerificationCompleted`, `VerificationRequested`,
   `VerificationCompleted`, `VerificationFailed`, `OtpSendRequested`,
   `MagicLinkSendRequested`.
2. THE Frontend AuthEvent enum SHALL use the `auth.` prefix naming convention
   consistent with existing events (e.g. `auth.login.succeeded`,
   `auth.device.new_detected`).
3. THE Frontend AuthEvent enum SHALL retain all existing event values to
   maintain backward compatibility.

### Requirement 14: Frontend Missing Auth Hooks

**User Story:** As a frontend developer, I want hooks for all auth operations
(register, challenge, verify, password management, identity linking), so that I
can build complete auth UIs declaratively.

#### Acceptance Criteria

1. THE Frontend SHALL provide a `useRegister` hook that wraps
   `AuthService.register()` as a TanStack mutation.
2. THE Frontend SHALL provide a `useChallenge` hook that wraps
   `AuthService.challenge()` as a TanStack mutation, accepting `provider` and
   optional `input` parameters.
3. THE Frontend SHALL provide a `useVerify` hook that wraps
   `AuthService.verify()` as a TanStack mutation, accepting `provider` and
   optional `input` parameters.
4. THE Frontend SHALL provide a `useForgotPassword` hook that wraps
   `AuthService.forgotPassword()` as a TanStack mutation.
5. THE Frontend SHALL provide a `useResetPassword` hook that wraps
   `AuthService.resetPassword()` as a TanStack mutation.
6. THE Frontend SHALL provide a `useUpdatePassword` hook that wraps
   `AuthService.updatePassword()` as a TanStack mutation.
7. THE Frontend SHALL provide a `useLinkProvider` hook that wraps
   `AuthService.link()` as a TanStack mutation.
8. THE Frontend SHALL provide a `useUnlinkProvider` hook that wraps
   `AuthService.unlink()` as a TanStack mutation.
9. THE Frontend SHALL provide a `useIdentity` hook that wraps
   `AuthService.getIdentity()` as a TanStack query with query key
   `['auth', 'identity']`, returning `{ identity, linked_providers }`.
10. THE Frontend SHALL provide a `useSession` hook that wraps SessionService
    operations (list, getCurrent, destroy, destroyAll) with TanStack queries and
    mutations.
11. THE Frontend SHALL provide a `useSecurity` hook that wraps
    `SecurityService.check()` as a TanStack query.
12. THE Frontend SHALL provide a `useActiveDevices` hook that wraps
    `SecurityService.getActiveDevices()` as a TanStack query and
    `SecurityService.revokeDevice()` as a TanStack mutation.
13. WHEN any auth hook is called without a configured service, THE Hook SHALL
    throw a descriptive error message indicating the service is not available.

### Requirement 15: Frontend Auth Hook Wiring Fix

**User Story:** As a frontend developer, I want `RefineModule.forRoot()` to wire
DI-resolved services to all hook setter functions, so that hooks work at runtime
without manual setup.

#### Acceptance Criteria

1. WHEN `RefineModule.forRoot()` is called, THE RefineModule SHALL invoke each
   auth hook Setter_Function with the DI-resolved AuthService instance.
2. WHEN `RefineModule.forRoot()` is called, THE RefineModule SHALL invoke the
   session hook Setter_Function with the DI-resolved SessionService instance.
3. WHEN `RefineModule.forRoot()` is called, THE RefineModule SHALL invoke the
   security hook Setter_Function with the DI-resolved SecurityService instance.
4. WHEN `RefineModule.forRoot()` is called with a user-supplied `authService`
   option, THE RefineModule SHALL pass that user-supplied instance to all auth
   hook Setter_Functions.
5. THE RefineModule SHALL consolidate all auth hook setter functions into a
   single `setAuthService` function that wires the AuthService to all auth hooks
   (`useLogin`, `useLogout`, `useIsAuthenticated`, `useGetIdentity`,
   `usePermissions`, `useRegister`, `useChallenge`, `useVerify`,
   `useForgotPassword`, `useResetPassword`, `useUpdatePassword`,
   `useLinkProvider`, `useUnlinkProvider`, `useIdentity`).

### Requirement 16: Frontend Barrel Exports Update

**User Story:** As a frontend developer, I want all new hooks, enums, and
interfaces exported from the package barrel, so that I can import them from
`@stackra/react-refine`.

#### Acceptance Criteria

1. THE hooks barrel export SHALL include exports for: `useRegister`,
   `useChallenge`, `useVerify`, `useForgotPassword`, `useResetPassword`,
   `useUpdatePassword`, `useLinkProvider`, `useUnlinkProvider`, `useIdentity`,
   `useSession`, `useSecurity`, `useActiveDevices`.
2. THE enums barrel export SHALL include an export for `AuthProvider`.
3. THE interfaces barrel export SHALL include type exports for any new
   interfaces added (e.g. challenge response, verify response).

### Requirement 17: Frontend Examples Update

**User Story:** As a frontend developer, I want the examples to demonstrate
multi-provider auth flows, session management, device management, and security
checks, so that I can learn how to use the full feature set.

#### Acceptance Criteria

1. THE examples SHALL include a component demonstrating multi-step auth using
   `useChallenge` and `useVerify` for an OAuth provider.
2. THE examples SHALL include a component demonstrating `useSession` for listing
   active sessions and revoking a specific session.
3. THE examples SHALL include a component demonstrating `useActiveDevices` for
   listing devices and revoking a device.
4. THE examples SHALL include a component demonstrating `useSecurity` for
   performing a post-login security check.
5. THE examples SHALL include a component demonstrating `useForgotPassword` and
   `useResetPassword` for the password reset flow.
6. THE examples SHALL include a component demonstrating `useLinkProvider` and
   `useUnlinkProvider` for identity linking management.

# Requirements Document

## Introduction

Complete the `@stackra/react-refine` package by fixing the critical auth hook
wiring bug, adding missing hooks (`useSession`, `useSecurity`,
`useActiveDevices`, `usePublish`), consolidating setter inconsistencies,
exporting missing types, writing comprehensive tests, and updating examples to
showcase the full feature set.

## Glossary

- **RefineModule**: The DI module class that provides `forRoot()` for global
  service configuration and `forFeature()` for per-resource registration.
- **Hook**: A React hook function (e.g. `useLogin`, `useSession`) that wraps a
  service method with TanStack React Query for state management.
- **Service**: A class registered in the DI container that communicates with a
  backend API (e.g. `AuthService`, `SessionService`, `SecurityService`).
- **Setter_Function**: A module-level function (e.g. `setAuthService()`) that
  assigns a service instance to a module-scoped variable so hooks can access the
  service without DI.
- **DI_Container**: The `@stackra/ts-container` dependency injection container
  that resolves service instances and their dependencies.
- **ServiceRegistry**: A singleton registry that maps resource names to service
  instances for data hooks.
- **TanStack_Query**: The `@tanstack/react-query` library used by all
  data-fetching and mutation hooks for caching, refetching, and state
  management.
- **Session**: A server-tracked user session object containing id, userId,
  deviceId, timestamps, and optional IP/user-agent metadata.
- **ActiveDevice**: A device with an active session, containing id, name,
  lastSeen, isCurrent, and optional ipAddress.
- **SecurityCheckResult**: The result of a security check containing status
  (`ok`, `locked`, `device_limit`, `force_password`), optional message,
  retryAfter, and activeDevices.
- **PublishParams**: Parameters for publishing a realtime event, containing
  channel, type, payload, and optional date.
- **Barrel_Export**: An `index.ts` file that re-exports symbols from a directory
  to provide a single import path.

## Requirements

### Requirement 1: Auth Hook Service Wiring

**User Story:** As a developer, I want `RefineModule.forRoot()` to automatically
connect DI-resolved services to hook setter functions, so that auth hooks work
at runtime without manual wiring.

#### Acceptance Criteria

1. WHEN `RefineModule.forRoot()` is called, THE RefineModule SHALL invoke each
   hook Setter_Function with the corresponding DI-resolved service instance for
   AuthService, AccessControlService, NotificationService, RealtimeService, and
   AuditLogService.
2. WHEN `RefineModule.forRoot()` is called with a user-supplied `authService`
   option, THE RefineModule SHALL pass that user-supplied instance to all auth
   hook Setter_Functions (`setAuthService`, `setLogoutAuthService`,
   `setIsAuthenticatedService`, `setGetIdentityService`,
   `setPermissionsService`).
3. WHEN `RefineModule.forRoot()` is called without a user-supplied `authService`
   option, THE RefineModule SHALL resolve the default AuthService from the
   DI_Container and pass it to all auth hook Setter_Functions.
4. WHEN `useLogin` is called after `RefineModule.forRoot()` has been configured,
   THE Hook SHALL execute the login mutation without throwing a "No AuthService
   configured" error.
5. WHEN `useLogout` is called after `RefineModule.forRoot()` has been
   configured, THE Hook SHALL execute the logout mutation without throwing a "No
   AuthService configured" error.

### Requirement 2: Auth Hook Setter Consolidation

**User Story:** As a developer, I want all auth hooks to use a single consistent
setter function name, so that the API is predictable and the wiring logic in
`forRoot()` is straightforward.

#### Acceptance Criteria

1. THE RefineModule SHALL use a single `setAuthService` Setter_Function to wire
   the AuthService to all five auth hooks (`useLogin`, `useLogout`,
   `useIsAuthenticated`, `useGetIdentity`, `usePermissions`).
2. WHEN the auth Setter_Function is called with an IAuthService instance, THE
   Hook module SHALL store that instance so all five auth hooks reference the
   same service.
3. THE RefineModule SHALL remove the individual setter functions
   (`setLogoutAuthService`, `setIsAuthenticatedService`,
   `setGetIdentityService`, `setPermissionsService`) and replace them with the
   single consolidated `setAuthService`.

### Requirement 3: useSession Hook

**User Story:** As a developer, I want a `useSession` hook that wraps
SessionService operations with TanStack_Query, so that I can manage user
sessions declaratively in React components.

#### Acceptance Criteria

1. THE `useSession` Hook SHALL expose a `current` query that fetches the current
   Session from SessionService using TanStack_Query with the query key
   `['session', 'current']`.
2. THE `useSession` Hook SHALL expose a `list` query that fetches all active
   Sessions from SessionService using TanStack_Query with the query key
   `['session', 'list']`.
3. THE `useSession` Hook SHALL expose a `create` mutation that calls
   `SessionService.create()` and invalidates the session query keys on success.
4. THE `useSession` Hook SHALL expose a `refresh` mutation that calls
   `SessionService.refresh()` and invalidates the session query keys on success.
5. THE `useSession` Hook SHALL expose a `destroy` mutation that accepts a
   session ID, calls `SessionService.destroy(sessionId)`, and invalidates the
   session query keys on success.
6. WHEN no SessionService is configured, THE `useSession` Hook SHALL throw a
   descriptive error message indicating that SessionService is not available.

### Requirement 4: useSecurity Hook

**User Story:** As a developer, I want a `useSecurity` hook that wraps
SecurityService operations with TanStack_Query, so that I can perform security
checks and device registration declaratively.

#### Acceptance Criteria

1. THE `useSecurity` Hook SHALL expose a `check` query that fetches the
   SecurityCheckResult from SecurityService using TanStack_Query with the query
   key `['security', 'check']`.
2. THE `useSecurity` Hook SHALL expose a `registerDevice` mutation that calls
   `SecurityService.registerDevice()` and returns the registered ActiveDevice.
3. WHEN no SecurityService is configured, THE `useSecurity` Hook SHALL throw a
   descriptive error message indicating that SecurityService is not available.

### Requirement 5: useActiveDevices Hook

**User Story:** As a developer, I want a `useActiveDevices` hook that fetches
and manages active devices with TanStack_Query, so that I can build device
management UIs.

#### Acceptance Criteria

1. THE `useActiveDevices` Hook SHALL expose a `devices` query that fetches all
   ActiveDevice records from SecurityService using TanStack_Query with the query
   key `['security', 'devices']`.
2. THE `useActiveDevices` Hook SHALL expose a `revoke` mutation that accepts a
   device ID, calls `SecurityService.revokeDevice(deviceId)`, and invalidates
   the devices query key on success.
3. WHEN no SecurityService is configured, THE `useActiveDevices` Hook SHALL
   throw a descriptive error message indicating that SecurityService is not
   available.

### Requirement 6: usePublish Hook

**User Story:** As a developer, I want a `usePublish` hook that wraps
`RealtimeService.publish()` as a TanStack_Query mutation, so that I can publish
realtime events from React components.

#### Acceptance Criteria

1. THE `usePublish` Hook SHALL expose a mutation that accepts PublishParams and
   calls `RealtimeService.publish(params)`.
2. THE `usePublish` Hook SHALL return the standard UseMutationHookResult shape
   (mutate, mutateAsync, isLoading, isError, isSuccess, isIdle, error, data,
   reset, mutation).
3. WHEN no RealtimeService is configured, THE `usePublish` Hook SHALL execute as
   a no-op mutation that resolves without error.

### Requirement 7: Hook and Service Barrel Exports

**User Story:** As a developer, I want all new hooks, the `resolveService`
utility, and service types (`Session`, `SecurityCheckResult`, `ActiveDevice`) to
be exported from the package barrel, so that I can import them from
`@stackra/react-refine`.

#### Acceptance Criteria

1. THE hooks Barrel_Export SHALL include exports for `useSession`,
   `useSecurity`, `useActiveDevices`, and `usePublish`.
2. THE hooks Barrel_Export SHALL include an export for the `resolveService`
   utility from `use-service.util.ts`.
3. THE types Barrel_Export SHALL include exports for `Session`,
   `SecurityCheckResult`, `ActiveDevice`, and `SecurityStatus` from the services
   barrel.

### Requirement 8: Service Unit Tests

**User Story:** As a developer, I want unit tests for all services (AuthService,
AccessControlService, NotificationService, RealtimeService, AuditLogService,
SessionService, SecurityService), so that I can verify service behavior in
isolation.

#### Acceptance Criteria

1. WHEN the AuthService `login` method is called with valid credentials, THE
   test SHALL verify that the method returns `{ success: true }` and persists
   the auth token.
2. WHEN the AuthService `login` method is called and the HTTP request fails, THE
   test SHALL verify that the method returns `{ success: false }` with an error.
3. WHEN the AuthService `check` method is called with no stored token, THE test
   SHALL verify that the method returns `{ authenticated: false }`.
4. WHEN the SessionService `create` method is called, THE test SHALL verify that
   the method posts to the sessions endpoint and persists the session locally.
5. WHEN the SessionService `destroy` method is called with the current session
   ID, THE test SHALL verify that the method deletes the session and clears
   local storage.
6. WHEN the SecurityService `check` method is called, THE test SHALL verify that
   the method returns a SecurityCheckResult from the API.
7. WHEN the SecurityService `registerDevice` method is called, THE test SHALL
   verify that the method posts the device ID and user-agent to the devices
   endpoint.
8. WHEN the SecurityService `revokeDevice` method is called, THE test SHALL
   verify that the method sends a DELETE request for the specified device ID.

### Requirement 9: Hook Integration Tests

**User Story:** As a developer, I want integration tests for all hooks using
React Testing Library and TanStack_Query test utilities, so that I can verify
the hook-to-service flow works correctly.

#### Acceptance Criteria

1. WHEN `useLogin` is rendered in a test with a mocked AuthService, THE test
   SHALL verify that calling `mutate` invokes `AuthService.login()` and the hook
   transitions through loading and success states.
2. WHEN `useSession` is rendered in a test with a mocked SessionService, THE
   test SHALL verify that the `current` query fetches the current session and
   the `create` mutation calls `SessionService.create()`.
3. WHEN `useActiveDevices` is rendered in a test with a mocked SecurityService,
   THE test SHALL verify that the `devices` query returns the device list and
   the `revoke` mutation calls `SecurityService.revokeDevice()`.
4. WHEN `usePublish` is rendered in a test with a mocked RealtimeService, THE
   test SHALL verify that calling `mutate` with PublishParams invokes
   `RealtimeService.publish()`.

### Requirement 10: RefineModule Wiring Tests

**User Story:** As a developer, I want tests that verify
`RefineModule.forRoot()` correctly wires services to hooks and `forFeature()`
correctly registers resource services, so that I can trust the module
configuration.

#### Acceptance Criteria

1. WHEN `RefineModule.forRoot()` is called with default options, THE test SHALL
   verify that all hook Setter_Functions receive a valid service instance.
2. WHEN `RefineModule.forRoot()` is called with a custom `authService`, THE test
   SHALL verify that the custom instance is passed to the auth hook
   Setter_Functions.
3. WHEN `RefineModule.forFeature([Post])` is called with a decorated model, THE
   test SHALL verify that the ServiceRegistry contains a service for the
   resource name.
4. WHEN `RefineModule.forFeature([UndecoredClass])` is called with a class
   missing `@Resource`, THE test SHALL verify that an error is thrown.

### Requirement 11: Updated Examples

**User Story:** As a developer, I want the `.examples/` files to showcase the
new hooks (`useSession`, `useSecurity`, `useActiveDevices`, `usePublish`), the
event system, and session/device management UI patterns, so that I can learn how
to use the full feature set.

#### Acceptance Criteria

1. THE examples SHALL include a component demonstrating `useSession` for
   displaying the current session and creating/refreshing/destroying sessions.
2. THE examples SHALL include a component demonstrating `useActiveDevices` for
   listing active devices and revoking a device.
3. THE examples SHALL include a component demonstrating `useSecurity` for
   performing a security check after login.
4. THE examples SHALL include a component demonstrating `usePublish` for
   publishing a realtime event.
5. THE examples SHALL include a component demonstrating the AuthEvent system by
   listening to events via `@stackra/ts-events`.

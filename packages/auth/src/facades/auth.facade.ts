/**
 * Auth Facade
 *
 * Typed proxy for {@link AuthService} from `@stackra-inc/react-auth`.
 *
 * Authentication service. Handles login, logout, registration, MFA, and sessions.
 *
 * The facade is a module-level constant typed as `AuthService`.
 * It lazily resolves the service from the DI container on first property
 * access — safe to use at module scope before bootstrap completes.
 *
 * ## Setup (once, in main.tsx)
 *
 * ```typescript
 * import { Application } from '@stackra-inc/ts-container';
 * import { Facade } from '@stackra-inc/ts-support';
 *
 * const app = await Application.create(AppModule);
 * Facade.setApplication(app); // wires all facades
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { AuthFacade } from '@stackra-inc/react-auth';
 *
 * // Full autocomplete — no .proxy() call needed
 * AuthFacade.login();
 * ```
 *
 * ## Available methods (from {@link AuthService})
 *
 * - `login(credentials: Record<string, unknown>): Promise<AuthActionResponse>`
 * - `logout(): Promise<void>`
 * - `register(data: Record<string, unknown>): Promise<AuthActionResponse>`
 * - `check(): Promise<CheckResponse>`
 * - `session(): Promise<AuthActionResponse>`
 *
 * ## Testing — swap in a mock
 *
 * ```typescript
 * import { Facade } from '@stackra-inc/ts-support';
 * import { AUTH_SERVICE } from '@/constants/tokens.constant';
 *
 * // Before test — replace the resolved instance
 * Facade.swap(AUTH_SERVICE, mockInstance);
 *
 * // After test — restore
 * Facade.clearResolvedInstances();
 * ```
 *
 * @module facades/auth
 * @see {@link AuthService} — the underlying service
 * @see {@link Facade} — the base class providing `make()`
 */

import { Facade } from '@stackra-inc/ts-support';

import { AUTH_SERVICE } from '@/constants/tokens.constant';
import type { IAuthService } from '@/interfaces/auth-service.interface';

/**
 * AuthFacade — typed proxy for {@link AuthService}.
 *
 * Resolves `AuthService` from the DI container via the `AUTH_SERVICE` token.
 * All property and method access is forwarded to the resolved instance
 * with correct `this` binding.
 *
 * Call `Facade.setApplication(app)` once during bootstrap before using this.
 *
 * @example
 * ```typescript
 * AuthFacade.login();
 * ```
 */
export const AuthFacade: IAuthService = Facade.make<IAuthService>(AUTH_SERVICE);

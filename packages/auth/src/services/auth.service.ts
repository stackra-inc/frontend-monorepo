/**
 * @fileoverview Default AuthService implementation.
 *
 * Provides a fully functional authentication service that communicates
 * with a backend API via the injected {@link HttpClient} from
 * `@stackra/ts-http`. Handles login, logout, registration,
 * multi-factor challenge/verify, password management, identity
 * provider linking, session checks, and identity retrieval.
 *
 * Users can override this by passing a custom `authService` to
 * `AuthModule.forRoot()`. The custom service must implement
 * {@link IAuthService}.
 *
 * @module @stackra/react-auth
 * @category Services
 *
 * @example
 * ```typescript
 * // Uses the built-in AuthService automatically:
 * AuthModule.forRoot();
 *
 * // Or supply your own:
 * AuthModule.forRoot({ authService: new MyCustomAuthService() });
 * ```
 */

import { Injectable, Inject, Optional } from '@stackra/ts-container';
import { HTTP_CLIENT } from '@stackra/ts-http';
import { EVENT_MANAGER } from '@stackra/ts-events';
import type { HttpClient, HttpResponse } from '@stackra/ts-http';
import type { EventManager } from '@stackra/ts-events';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/constants';
import type { IAuthService } from '@/interfaces/auth-service.interface';
import type { AuthActionResponse } from '@/interfaces/auth-action-response.interface';
import type { CheckResponse } from '@/interfaces/check-response.interface';
import type { OnErrorResponse } from '@/interfaces/on-error-response.interface';
import { AuthEvent } from '@/enums/auth-event.enum';

/**
 * Default authentication service.
 *
 * Communicates with a backend API using the injected {@link HttpClient}.
 * Persists auth state in `localStorage` so that sessions survive page reloads.
 *
 * ### API Contract
 *
 * | Operation       | Method | Endpoint                   | Response                              |
 * |-----------------|--------|----------------------------|---------------------------------------|
 * | Login           | POST   | `/api/auth/login`          | `{ token, user }`                     |
 * | Logout          | POST   | `/api/auth/logout`         | —                                     |
 * | Register        | POST   | `/api/auth/register`       | `{ token, user }`                     |
 * | Challenge       | POST   | `/api/auth/challenge`      | Provider-specific                     |
 * | Verify          | POST   | `/api/auth/verify`         | `{ token, user }`                     |
 * | Forgot Password | POST   | `/api/auth/forgot-password`| `{ success }`                         |
 * | Reset Password  | POST   | `/api/auth/reset-password` | `{ success }`                         |
 * | Update Password | POST   | `/api/auth/update-password`| `{ success }`                         |
 * | Link Provider   | POST   | `/api/auth/link`           | `{ success }`                         |
 * | Unlink Provider | DELETE | `/api/auth/unlink/:provider`| —                                    |
 * | Check           | GET    | `/api/auth/check`          | `{ authenticated }`                   |
 * | Identity        | GET    | `/api/auth/identity`       | `{ identity, linked_providers }`      |
 * | Session         | GET    | `/api/auth/me`             | `{ user, token, permissions, roles }` |
 * | Permissions     | GET    | `/api/auth/permissions`    | `{ permissions: string[] }`           |
 */
@Injectable()
export class AuthService implements IAuthService {
  /**
   * Create a new AuthService instance.
   *
   * @param http - The {@link HttpClient} instance injected via DI.
   * @param eventManager - The {@link EventManager} instance injected via DI (optional).
   */
  constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Optional() @Inject(EVENT_MANAGER) private readonly eventManager?: EventManager
  ) {}

  // ─── Private Helpers ─────────────────────────────────────────────

  /**
   * Retrieve the stored authentication token.
   * @returns The token string, or `null` if not authenticated.
   */
  private getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Persist authentication credentials in local storage.
   * @param token - The JWT or session token.
   * @param user - The user identity object.
   */
  private persistAuth(token: string, user: any): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all persisted authentication data from local storage.
   */
  private clearAuth(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  /**
   * Dispatch an auth event through the event manager (if available).
   * @param event - The {@link AuthEvent} name.
   * @param payload - Optional event payload.
   */
  private dispatch(event: AuthEvent, payload?: unknown): void {
    if (!this.eventManager) return;
    try {
      this.eventManager.dispatcher().dispatch(event, payload);
    } catch {
      /* Swallow — event dispatching should never break auth flow */
    }
  }

  // ─── IAuthService Implementation ────────────────────────────────

  /** {@inheritDoc IAuthService.login} */
  async login(params: any): Promise<AuthActionResponse> {
    this.dispatch(AuthEvent.LoginAttempt, { params });

    try {
      const response: HttpResponse<{ token: string; user: any }> = await this.http.post(
        '/api/auth/login',
        params
      );

      this.persistAuth(response.data.token, response.data.user);
      this.dispatch(AuthEvent.LoginSucceeded, {
        user: response.data.user,
        token: response.data.token,
      });

      return { success: true, redirectTo: '/' };
    } catch (error: any) {
      const err = new Error(error?.response?.data?.message ?? error?.message ?? 'Login failed');
      this.dispatch(AuthEvent.LoginFailed, { error: err, params });

      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.logout} */
  async logout(_params?: any): Promise<AuthActionResponse> {
    this.dispatch(AuthEvent.LogoutAttempt, {});

    try {
      await this.http.post('/api/auth/logout');
    } catch {
      /* Swallow — we clear local state regardless */
    }

    this.clearAuth();
    this.dispatch(AuthEvent.LogoutCompleted, {});

    return { success: true, redirectTo: '/login' };
  }

  /** {@inheritDoc IAuthService.register} */
  async register(params: any): Promise<AuthActionResponse> {
    try {
      const response: HttpResponse<{ token: string; user: any }> = await this.http.post(
        '/api/auth/register',
        params
      );

      this.persistAuth(response.data.token, response.data.user);
      this.dispatch(AuthEvent.RegistrationCompleted, { user: response.data.user });

      return { success: true, redirectTo: '/' };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Registration failed'
      );
      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.challenge} */
  async challenge(provider: string, input?: Record<string, any>): Promise<any> {
    const response = await this.http.post('/api/auth/challenge', { provider, ...input });
    return response.data;
  }

  /** {@inheritDoc IAuthService.verify} */
  async verify(provider: string, input?: Record<string, any>): Promise<AuthActionResponse> {
    try {
      const response: HttpResponse<any> = await this.http.post('/api/auth/verify', {
        provider,
        ...input,
      });

      this.dispatch(AuthEvent.VerificationCompleted, { provider });

      /* If the verify response includes a token, persist it */
      if (response.data?.token) {
        this.persistAuth(response.data.token, response.data.user);
      }

      return { success: true, redirectTo: '/' };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Verification failed'
      );
      this.dispatch(AuthEvent.VerificationFailed, { provider, error: err });

      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.forgotPassword} */
  async forgotPassword(email: string): Promise<AuthActionResponse> {
    try {
      await this.http.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Forgot password request failed'
      );
      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.resetPassword} */
  async resetPassword(email: string, token: string, password: string): Promise<AuthActionResponse> {
    try {
      await this.http.post('/api/auth/reset-password', { email, token, password });
      this.dispatch(AuthEvent.PasswordChanged, {});
      return { success: true, redirectTo: '/login' };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Password reset failed'
      );
      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.updatePassword} */
  async updatePassword(currentPassword: string, password: string): Promise<AuthActionResponse> {
    try {
      await this.http.post('/api/auth/update-password', {
        current_password: currentPassword,
        password,
      });
      this.dispatch(AuthEvent.PasswordChanged, {});
      return { success: true };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Password update failed'
      );
      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.link} */
  async link(provider: string, input?: Record<string, any>): Promise<AuthActionResponse> {
    try {
      await this.http.post('/api/auth/link', { provider, ...input });
      this.dispatch(AuthEvent.IdentityLinked, { provider });
      return { success: true };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Provider linking failed'
      );
      this.dispatch(AuthEvent.IdentityLinkingFailed, { provider, error: err });
      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.unlink} */
  async unlink(provider: string): Promise<AuthActionResponse> {
    try {
      await this.http.delete(`/api/auth/unlink/${provider}`);
      this.dispatch(AuthEvent.IdentityUnlinked, { provider });
      return { success: true };
    } catch (error: any) {
      const err = new Error(
        error?.response?.data?.message ?? error?.message ?? 'Provider unlinking failed'
      );
      return { success: false, error: err };
    }
  }

  /** {@inheritDoc IAuthService.check} */
  async check(): Promise<CheckResponse> {
    const token = this.getToken();

    if (!token) {
      return { authenticated: false, redirectTo: '/login' };
    }

    try {
      const response: HttpResponse<{ authenticated: boolean }> =
        await this.http.get('/api/auth/check');
      return { authenticated: response.data.authenticated };
    } catch {
      this.clearAuth();
      this.dispatch(AuthEvent.TokenExpired, {});
      return { authenticated: false, redirectTo: '/login' };
    }
  }

  /** {@inheritDoc IAuthService.getIdentity} */
  async getIdentity(): Promise<any> {
    /* Try local cache first */
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(AUTH_USER_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          /* Corrupted cache — fall through to API */
        }
      }
    }

    try {
      const response: HttpResponse<{ identity: any; linked_providers: string[] }> =
        await this.http.get('/api/auth/identity');

      const identity = response.data;

      if (typeof localStorage !== 'undefined' && identity?.identity) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(identity.identity));
      }

      this.dispatch(AuthEvent.IdentityLoaded, { identity });

      return identity;
    } catch {
      return null;
    }
  }

  /** {@inheritDoc IAuthService.getSession} */
  async getSession(): Promise<any> {
    try {
      const response: HttpResponse<{ user: any; token: string; permissions: any; roles: any }> =
        await this.http.get('/api/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  /** {@inheritDoc IAuthService.getPermissions} */
  async getPermissions(): Promise<any> {
    try {
      const response: HttpResponse<{ permissions: string[] }> =
        await this.http.get('/api/auth/permissions');

      const permissions = response.data.permissions ?? [];
      this.dispatch(AuthEvent.PermissionsLoaded, { permissions });

      return permissions;
    } catch {
      return [];
    }
  }

  /** {@inheritDoc IAuthService.onError} */
  async onError(error: any): Promise<OnErrorResponse> {
    const statusCode = error?.statusCode ?? error?.status ?? 0;

    if (statusCode === 401) {
      this.clearAuth();
      return { logout: true, redirectTo: '/login' };
    }

    if (statusCode === 403) {
      return { redirectTo: '/forbidden' };
    }

    return {};
  }
}

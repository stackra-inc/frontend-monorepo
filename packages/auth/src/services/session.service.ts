/**
 * @fileoverview Session Service.
 *
 * Manages user session state, persistence, and lifecycle. Tracks
 * the current session in `localStorage` and communicates with the
 * backend API via the injected {@link HttpClient} for server-side
 * session operations (list, get current, destroy, destroy all).
 *
 * Dispatches {@link AuthEvent} events through `@stackra-inc/ts-events`
 * on every session lifecycle change.
 *
 * @module @stackra-inc/react-auth
 * @category Services
 *
 * @example
 * ```typescript
 * import { Inject } from '@stackra-inc/ts-container';
 * import { SESSION_SERVICE } from '@stackra-inc/react-auth';
 * import type { SessionService } from '@stackra-inc/react-auth';
 *
 * @Injectable()
 * class DashboardService {
 *   constructor(@Inject(SESSION_SERVICE) private session: SessionService) {}
 *
 *   async init() {
 *     const current = await this.session.getCurrent();
 *     console.log('Current session:', current);
 *   }
 * }
 * ```
 */

import { Injectable, Inject, Optional } from '@stackra-inc/ts-container';
import { HTTP_CLIENT } from '@stackra-inc/ts-http';
import { EVENT_MANAGER } from '@stackra-inc/ts-events';
import type { HttpClient, HttpResponse } from '@stackra-inc/ts-http';
import type { EventManager } from '@stackra-inc/ts-events';
import { AuthEvent } from '@/enums/auth-event.enum';
import { SESSION_STORAGE_KEY } from '@/constants';
import type { Session } from '@/interfaces/session.interface';

/**
 * Session Service.
 *
 * Manages the current user's session lifecycle. Persists the active
 * session in `localStorage` for quick access and communicates with
 * the backend for server-side session management.
 *
 * ### API Contract
 *
 * | Operation    | Method | Endpoint                     | Response                  |
 * |--------------|--------|------------------------------|---------------------------|
 * | List         | GET    | `/api/auth/sessions`         | `{ sessions: Session[] }` |
 * | Current      | GET    | `/api/auth/sessions/current` | `{ session: Session }`    |
 * | Destroy      | DELETE | `/api/auth/sessions/:id`     | —                         |
 * | Destroy All  | DELETE | `/api/auth/sessions`         | —                         |
 */
@Injectable()
export class SessionService {
  /**
   * @param http - The {@link HttpClient} for API communication.
   * @param eventManager - Optional event manager for dispatching session events.
   */
  constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Optional() @Inject(EVENT_MANAGER) private readonly eventManager?: EventManager
  ) {}

  // ─── Private Helpers ─────────────────────────────────────────────

  /**
   * Dispatch a session event through the event manager (if available).
   * @param event - The {@link AuthEvent} name.
   * @param payload - Optional event payload.
   */
  private dispatch(event: AuthEvent, payload?: unknown): void {
    if (!this.eventManager) return;
    try {
      this.eventManager.dispatcher().dispatch(event, payload);
    } catch {
      /* Swallow — event dispatching should never break session flow */
    }
  }

  // ─── Local State ─────────────────────────────────────────────────

  /**
   * Get the cached current session from local storage.
   * @returns The persisted {@link Session}, or `null` if none exists.
   */
  get(): Session | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  /**
   * Persist a session to local storage.
   * @param session - The session to persist.
   */
  save(session: Session): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Clear the persisted session from local storage.
   */
  clear(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  // ─── API Operations ──────────────────────────────────────────────

  /**
   * List all active sessions for the current user.
   * @returns An array of active {@link Session} objects.
   */
  async list(): Promise<Session[]> {
    try {
      const response: HttpResponse<{ sessions: Session[] }> =
        await this.http.get('/api/auth/sessions');

      return response.data.sessions ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Fetch the current active session from the server.
   * Updates local storage with the server's version.
   * @returns The current {@link Session}, or `null` if none.
   */
  async getCurrent(): Promise<Session | null> {
    try {
      const response: HttpResponse<{ session: Session }> = await this.http.get(
        '/api/auth/sessions/current'
      );

      const session = response.data.session;
      this.save(session);
      return session;
    } catch {
      this.clear();
      return null;
    }
  }

  /**
   * Destroy a specific session by ID.
   * If the destroyed session is the current one, local storage is cleared.
   * @param sessionId - The session ID to destroy.
   */
  async destroy(sessionId: string): Promise<void> {
    await this.http.delete(`/api/auth/sessions/${sessionId}`);

    const current = this.get();
    if (current?.id === sessionId) {
      this.clear();
    }

    this.dispatch(AuthEvent.SessionDestroyed, { sessionId });
  }

  /**
   * Destroy all sessions for the current user.
   * Clears local storage after the request.
   */
  async destroyAll(): Promise<void> {
    await this.http.delete('/api/auth/sessions');
    this.clear();
    this.dispatch(AuthEvent.SessionDestroyed, { all: true });
  }
}

/**
 * @fileoverview Security Service.
 *
 * Handles security checks and active device management.
 * Communicates with the backend API via the injected
 * {@link HttpClient} and dispatches {@link AuthEvent} events on
 * security-related state changes.
 *
 * @module @stackra-inc/react-auth
 * @category Services
 *
 * @example
 * ```typescript
 * import { Inject } from '@stackra-inc/ts-container';
 * import { SECURITY_SERVICE } from '@stackra-inc/react-auth';
 * import type { SecurityService } from '@stackra-inc/react-auth';
 *
 * @Injectable()
 * class LoginFlow {
 *   constructor(@Inject(SECURITY_SERVICE) private security: SecurityService) {}
 *
 *   async afterLogin() {
 *     const check = await this.security.check();
 *     if (check.status === 'locked') {
 *       // handle locked account
 *     }
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
import type { SecurityCheckResult } from '@/interfaces/security-check-result.interface';
import type { ActiveDevice } from '@/interfaces/active-device.interface';

/**
 * Security Service.
 *
 * Manages security checks and active device listing/revocation.
 *
 * ### API Contract
 *
 * | Operation       | Method | Endpoint                       | Response                        |
 * |-----------------|--------|--------------------------------|---------------------------------|
 * | Security check  | GET    | `/api/auth/security/check`     | `SecurityCheckResult`           |
 * | List devices    | GET    | `/api/auth/devices`            | `{ devices: ActiveDevice[] }`   |
 * | Revoke device   | DELETE | `/api/auth/devices/:fingerprint`| —                              |
 */
@Injectable()
export class SecurityService {
  /**
   * @param http - The {@link HttpClient} for API communication.
   * @param eventManager - Optional event manager for dispatching security events.
   */
  constructor(
    @Inject(HTTP_CLIENT) private readonly http: HttpClient,
    @Optional() @Inject(EVENT_MANAGER) private readonly eventManager?: EventManager
  ) {}

  // ─── Private Helpers ─────────────────────────────────────────────

  /**
   * Dispatch a security event through the event manager (if available).
   * @param event - The {@link AuthEvent} name.
   * @param payload - Optional event payload.
   */
  private dispatch(event: AuthEvent, payload?: unknown): void {
    if (!this.eventManager) return;
    try {
      this.eventManager.dispatcher().dispatch(event, payload);
    } catch {
      /* Swallow — event dispatching should never break security flow */
    }
  }

  // ─── Security Check ──────────────────────────────────────────────

  /**
   * Perform a security check for the current user.
   *
   * Checks for account locks, device limits, forced password changes,
   * etc. Should be called after login to ensure the account is in a
   * valid state.
   *
   * @returns A {@link SecurityCheckResult} with the current status.
   */
  async check(): Promise<SecurityCheckResult> {
    try {
      const response: HttpResponse<SecurityCheckResult> = await this.http.get(
        '/api/auth/security/check'
      );

      const result = response.data;

      if (result.status === 'locked') {
        this.dispatch(AuthEvent.AccountLocked, {
          reason: result.message,
          retryAfter: result.retryAfter,
        });
      }

      return result;
    } catch {
      /* Network error — assume OK to avoid blocking the user */
      return { status: 'ok' };
    }
  }

  // ─── Device Management ───────────────────────────────────────────

  /**
   * Fetch all active devices for the current user.
   * @returns An array of {@link ActiveDevice} objects.
   */
  async getActiveDevices(): Promise<ActiveDevice[]> {
    try {
      const response: HttpResponse<{ devices: ActiveDevice[] }> =
        await this.http.get('/api/auth/devices');

      return response.data.devices ?? [];
    } catch {
      return [];
    }
  }

  /**
   * Revoke a specific device by its fingerprint hash.
   * @param fingerprint - The device fingerprint hash to revoke.
   */
  async revokeDevice(fingerprint: string): Promise<void> {
    await this.http.delete(`/api/auth/devices/${fingerprint}`);
    this.dispatch(AuthEvent.DeviceRevoked, { fingerprint });
  }
}

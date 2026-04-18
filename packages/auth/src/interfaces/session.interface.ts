/**
 * @fileoverview Session interface.
 *
 * Shape of a user session as returned by the backend
 * `UserSessionResource`. Managed by the {@link SessionService}.
 *
 * @module @stackra/react-auth
 * @category Interfaces
 */

/**
 * Shape of a user session matching the backend `UserSessionResource`.
 */
export interface Session {
  /** Unique session identifier (server-generated). */
  id: string;
  /** The authenticated user's ID. */
  user_id: string;
  /** Device fingerprint metadata, or `null` if unavailable. */
  device_fingerprint: Record<string, any> | null;
  /** IP address of the client that created the session. */
  ip_address: string | null;
  /** User-agent string of the client. */
  user_agent: string | null;
  /** Whether this is the session making the current request. */
  is_current: boolean;
  /** ISO timestamp when the session was last active. */
  last_active_at: string;
  /** ISO timestamp when the session expires, or `null` if no expiry. */
  expires_at: string | null;
  /** ISO timestamp when the session was created. */
  created_at: string;
}

/**
 * @fileoverview Security check result interface.
 *
 * Result of a security check performed by the {@link SecurityService}.
 *
 * @module @stackra-inc/react-auth
 * @category Interfaces
 */

import type { SecurityStatus } from './security-status.interface';
import type { ActiveDevice } from './active-device.interface';

/**
 * Result of a security check.
 */
export interface SecurityCheckResult {
  /** Current security status. */
  status: SecurityStatus;
  /** Human-readable message (e.g. reason for lock). */
  message?: string;
  /** Seconds until the account is automatically unlocked. */
  retryAfter?: number;
  /** List of active devices (when status is `device_limit`). */
  activeDevices?: ActiveDevice[];
}

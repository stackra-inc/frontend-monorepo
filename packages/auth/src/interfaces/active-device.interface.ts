/**
 * @fileoverview Active device interface.
 *
 * Represents a device with an active session, as returned by the
 * backend `DeviceController`.
 *
 * @module @stackra/react-auth
 * @category Interfaces
 */

/**
 * Represents a device that has an active session.
 * Matches the backend `DeviceController` response shape.
 */
export interface ActiveDevice {
  /** Hashed device fingerprint identifier. */
  fingerprint_hash: string;
  /** Human-readable device name (e.g. "Chrome on macOS"). */
  name: string;
  /** ISO timestamp of the last activity on this device. */
  last_seen: string;
  /** IP address of the device, or `null` if unavailable. */
  ip_address: string | null;
  /** Whether this is the device making the current request. */
  is_current: boolean;
}

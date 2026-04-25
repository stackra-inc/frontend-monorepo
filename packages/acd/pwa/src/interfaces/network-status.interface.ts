/**
 * @fileoverview NetworkStatus — shape of the network status state.
 * @module pwa/offline-indicator/interfaces/network-status
 */

/**
 * Network status information.
 */
export interface NetworkStatus {
  /** Whether the device is currently online. */
  isOnline: boolean;

  /** Whether the device was previously offline and just came back online. */
  wasOffline: boolean;

  /** Timestamp of the last status change. */
  lastChanged: number;
}

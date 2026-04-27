/**
 * @fileoverview Connection status enumeration for WebSocket state tracking.
 * @module @stackra/ts-realtime
 * @category Enums
 */

/**
 * Represents the possible states of the realtime WebSocket connection.
 *
 * The connection transitions through these states during its lifecycle:
 * - `Disconnected` → `Connecting` → `Connected` (normal flow)
 * - `Connected` → `Reconnecting` → `Connecting` → `Connected` (recovery)
 * - `Connecting` → `Error` (failure with no reconnection configured)
 *
 * @description
 * Used by `RealtimeManager.getStatus()`, `onStatusChange()`, and the
 * `useRealtime` hook to observe and react to connection state changes.
 *
 * @example
 * ```typescript
 * import { ConnectionStatus } from '@stackra/ts-realtime';
 *
 * if (manager.getStatus() === ConnectionStatus.Connected) {
 *   console.log('WebSocket is active');
 * }
 * ```
 */
export enum ConnectionStatus {
  /** WebSocket connection is active and ready. */
  Connected = 'connected',

  /** Initial connection attempt is in progress. */
  Connecting = 'connecting',

  /** Not connected (initial state or after explicit disconnect). */
  Disconnected = 'disconnected',

  /** Attempting to re-establish a lost connection via exponential backoff. */
  Reconnecting = 'reconnecting',

  /** Connection failed with no reconnection configured. */
  Error = 'error',
}

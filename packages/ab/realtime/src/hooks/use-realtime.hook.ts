/**
 * @fileoverview useRealtime React hook for connection status and manager access.
 * @module @stackra/ts-realtime
 * @category Hooks
 */

import { useState, useEffect } from 'react';
import { useInject } from '@stackra/ts-container';

import { REALTIME_MANAGER } from '../constants/tokens.constant';
import { ConnectionStatus } from '../enums/connection-status.enum';
import type { RealtimeManager } from '../services/realtime-manager.service';

/**
 * Return type for the `useRealtime` hook.
 */
export interface UseRealtimeReturn {
  /** The current connection status. */
  status: ConnectionStatus;
  /** Whether the WebSocket connection is currently active. */
  isConnected: boolean;
  /** The `RealtimeManager` instance for imperative operations. */
  manager: RealtimeManager;
}

/**
 * React hook for accessing the realtime connection status and manager.
 *
 * Subscribes to `onStatusChange()` and triggers a re-render whenever the
 * connection state transitions. Provides direct access to the
 * `RealtimeManager` instance for imperative channel operations.
 *
 * @returns An object containing `status`, `isConnected`, and `manager`
 *
 * @example
 * ```tsx
 * import { useRealtime, ConnectionStatus } from '@stackra/ts-realtime';
 *
 * function ConnectionIndicator() {
 *   const { status, isConnected, manager } = useRealtime();
 *
 *   return (
 *     <div>
 *       <span>Status: {status}</span>
 *       {!isConnected && (
 *         <button onClick={() => manager.connect()}>
 *           Reconnect
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRealtime(): UseRealtimeReturn {
  const manager = useInject<RealtimeManager>(REALTIME_MANAGER);

  if (!manager) {
    throw new Error(
      'RealtimeManager not found. Import RealtimeModule.forRoot() in your app module.'
    );
  }

  const [status, setStatus] = useState<ConnectionStatus>(manager.getStatus());

  useEffect(() => {
    // Sync initial status in case it changed between render and effect
    setStatus(manager.getStatus());

    const unsubscribe = manager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return unsubscribe;
  }, [manager]);

  return {
    status,
    isConnected: status === ConnectionStatus.Connected,
    manager,
  };
}

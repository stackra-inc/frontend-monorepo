/**
 * @fileoverview useNetworkStatus — hook that tracks online/offline state.
 *
 * Listens to `online` and `offline` window events and returns
 * the current network status with reconnection detection.
 *
 * @module pwa/hooks/use-network-status
 */

import { useState, useEffect, useCallback } from 'react';
import type { NetworkStatus } from '@/interfaces';

/**
 * Track the device's online/offline status.
 *
 * @returns Current network status with `isOnline`, `wasOffline`, and `lastChanged`.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastChanged: Date.now(),
  });

  const goOnline = useCallback(() => {
    setStatus((prev) => ({
      isOnline: true,
      wasOffline: !prev.isOnline,
      lastChanged: Date.now(),
    }));
  }, []);

  const goOffline = useCallback(() => {
    setStatus({
      isOnline: false,
      wasOffline: false,
      lastChanged: Date.now(),
    });
  }, []);

  useEffect(() => {
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [goOnline, goOffline]);

  return status;
}

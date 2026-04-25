/**
 * @fileoverview OfflineIndicator — fixed-top banner showing network status.
 *
 * Uses HeroUI Alert (compound pattern) for consistent styling.
 * Shows a danger alert when offline, a success alert on reconnect
 * that auto-hides after a configurable duration.
 *
 * @module pwa/components/offline-indicator
 */

import React, { useEffect, useState } from 'react';
import { Alert } from '@heroui/react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePwa } from '@/hooks/use-pwa';
import { OFFLINE_DEFAULTS } from '@/constants';

/** Props for the OfflineIndicator component. */
export interface OfflineIndicatorProps {
  /** Duration in ms to show the "back online" banner. @default 3000 */
  reconnectDuration?: number;
  /** Custom offline message. */
  offlineMessage?: string;
  /** Custom reconnect message. */
  reconnectMessage?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Fixed-top network status banner.
 *
 * @example
 * ```tsx
 * <PwaProvider>
 *   <OfflineIndicator />
 *   <App />
 * </PwaProvider>
 * ```
 */
export function OfflineIndicator({
  reconnectDuration = OFFLINE_DEFAULTS.RECONNECT_BANNER_MS,
  offlineMessage = OFFLINE_DEFAULTS.OFFLINE_MESSAGE,
  reconnectMessage = OFFLINE_DEFAULTS.RECONNECT_MESSAGE,
  className,
}: OfflineIndicatorProps): React.JSX.Element | null {
  const { network } = usePwa();
  const [showReconnect, setShowReconnect] = useState(false);

  useEffect(() => {
    if (network.isOnline && network.wasOffline) {
      setShowReconnect(true);
      const timer = setTimeout(() => setShowReconnect(false), reconnectDuration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [network.isOnline, network.wasOffline, reconnectDuration]);

  if (network.isOnline && !showReconnect) return null;

  const isOffline = !network.isOnline;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-[9999] ${className ?? ''}`}
      role="status"
      aria-live="assertive"
    >
      <Alert status={isOffline ? 'danger' : 'success'}>
        <Alert.Indicator>{isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}</Alert.Indicator>
        <Alert.Content>
          <Alert.Title>{isOffline ? offlineMessage : reconnectMessage}</Alert.Title>
        </Alert.Content>
      </Alert>
    </div>
  );
}

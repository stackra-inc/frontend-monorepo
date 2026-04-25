/**
 * @fileoverview useSubscription hook — realtime subscriptions.
 *
 * Resolves the RealtimeService from the DI container via `useInject`
 * and subscribes to a real-time channel. No setter functions needed.
 *
 * @module @stackra/react-refine
 * @category Hooks
 */

import { useEffect } from 'react';
import { useOptionalInject } from '@stackra/ts-container';
import { REALTIME_SERVICE } from '@/constants';
import type { IRealtimeService } from '@/interfaces/realtime-service.interface';
import type { UseSubscriptionProps } from '@/interfaces/use-subscription-props.interface';

/**
 * Subscribe to a real-time channel.
 *
 * Resolves the `IRealtimeService` from the DI container via the
 * `REALTIME_SERVICE` token. If no realtime service is configured,
 * the hook is a no-op.
 *
 * @param props - Subscription parameters (channel, types, callback, enabled).
 */
export function useSubscription(props: UseSubscriptionProps): void {
  const realtimeService = useOptionalInject<IRealtimeService>(REALTIME_SERVICE);
  const { channel, types, onLiveEvent, enabled = true } = props;

  useEffect(() => {
    if (!enabled || !realtimeService) return;

    const unsubscribe = realtimeService.subscribe({
      channel,
      types,
      callback: onLiveEvent,
    });

    return unsubscribe;
  }, [channel, types, onLiveEvent, enabled, realtimeService]);
}

/** @fileoverview useSubscription hook — realtime subscriptions. @module @abdokouta/react-refine @category Hooks */
import { useEffect } from 'react';
import type { IRealtimeService } from '@/interfaces/i-realtime-service.interface';
import type { UseSubscriptionProps } from '@/interfaces/use-subscription-props.interface';

let _realtimeService: IRealtimeService | undefined;
export function setRealtimeService(svc: IRealtimeService) {
  _realtimeService = svc;
}

export function useSubscription(props: UseSubscriptionProps): void {
  const { channel, types, onLiveEvent, enabled = true } = props;
  useEffect(() => {
    if (!enabled || !_realtimeService) return;
    const unsubscribe = _realtimeService.subscribe({ channel, types, callback: onLiveEvent });
    return unsubscribe;
  }, [channel, types, onLiveEvent, enabled]);
}

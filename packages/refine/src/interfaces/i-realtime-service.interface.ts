/**
 * @fileoverview Realtime service interface.
 *
 * Defines the contract for real-time subscriptions and event publishing.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

import type { SubscribeParams } from './subscribe-params.interface';
import type { PublishParams } from './publish-params.interface';

/**
 * Realtime service interface.
 *
 * Implementations handle subscribing to channels and publishing events.
 */
export interface IRealtimeService {
  /**
   * Subscribe to a real-time channel.
   * @param params - Subscription parameters.
   * @returns Unsubscribe function.
   */
  subscribe(params: SubscribeParams): () => void;

  /**
   * Publish an event to a channel.
   * @param params - Publish parameters.
   */
  publish(params: PublishParams): Promise<void>;
}

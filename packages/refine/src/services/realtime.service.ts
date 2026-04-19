/**
 * @fileoverview Redis-backed RealtimeService implementation.
 *
 * Uses `@stackra-inc/ts-redis` (Upstash HTTP) for pub/sub-style
 * realtime communication. Publishing sends messages via Redis
 * `PUBLISH`. Subscribing polls a Redis list for new messages
 * since Upstash's HTTP transport does not support persistent
 * subscriptions.
 *
 * ### How it works
 *
 * - **Publish:** Serializes the event as JSON and publishes it
 *   to a Redis channel via `connection.publish()`. Additionally
 *   pushes the event to a Redis list (`channel:events`) so that
 *   polling subscribers can pick it up.
 *
 * - **Subscribe:** Starts a polling loop that reads new events
 *   from the Redis list (`channel:events`) at a configurable
 *   interval. Events matching the requested types are forwarded
 *   to the callback. The returned unsubscribe function stops
 *   the polling loop.
 *
 * ### Why polling?
 *
 * Upstash Redis uses an HTTP REST API — there are no persistent
 * TCP connections, so native Redis `SUBSCRIBE` is not available.
 * Polling a list is the simplest reliable pattern for HTTP-based
 * Redis clients.
 *
 * @module @stackra-inc/react-refine
 * @category Services
 *
 * @example
 * ```typescript
 * import { RealtimeService } from '@stackra-inc/react-refine';
 * import { RedisManager } from '@stackra-inc/ts-redis';
 *
 * const redis = container.resolve(RedisManager);
 * const realtime = new RealtimeService(redis);
 *
 * RefineModule.forRoot({
 *   realtimeService: realtime,
 * });
 * ```
 */

import { REDIS_MANAGER } from '@stackra-inc/ts-redis';
import type { RedisManager } from '@stackra-inc/ts-redis';
import { Injectable, Inject, Optional } from '@stackra-inc/ts-container';

import type { IRealtimeService } from '@/interfaces/realtime-service.interface';
import type { SubscribeParams } from '@/interfaces/subscribe-params.interface';
import type { PublishParams } from '@/interfaces/publish-params.interface';
import type { LiveEvent } from '@/interfaces/live-event.interface';

/**
 * Default polling interval in milliseconds.
 * @internal
 */
const DEFAULT_POLL_INTERVAL = 2000;

/**
 * Redis key prefix for event lists.
 * @internal
 */
const EVENT_LIST_PREFIX = 'refine:realtime:';

/**
 * Configuration options for {@link RealtimeService}.
 */
export interface RealtimeConfig {
  /** Polling interval in milliseconds. @default 2000 */
  pollInterval?: number;
  /** Redis connection name to use. Uses default if omitted. */
  connectionName?: string;
  /** Key prefix for event lists. @default 'refine:realtime:' */
  keyPrefix?: string;
  /** Max events to retain per channel. @default 100 */
  maxEventsPerChannel?: number;
}

/**
 * Redis-backed realtime service.
 *
 * Implements {@link IRealtimeService} using `@stackra-inc/ts-redis`
 * for event publishing and polling-based subscriptions.
 */
@Injectable()
export class RealtimeService implements IRealtimeService {
  private readonly pollInterval: number;
  private readonly connectionName?: string;
  private readonly keyPrefix: string;
  private readonly maxEvents: number;

  constructor(
    @Inject(REDIS_MANAGER) private readonly redis: RedisManager,
    @Optional() config?: RealtimeConfig
  ) {
    this.pollInterval = config?.pollInterval ?? DEFAULT_POLL_INTERVAL;
    this.connectionName = config?.connectionName;
    this.keyPrefix = config?.keyPrefix ?? EVENT_LIST_PREFIX;
    this.maxEvents = config?.maxEventsPerChannel ?? 100;
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  /**
   * Build the Redis list key for a channel.
   */
  private listKey(channel: string): string {
    return `${this.keyPrefix}${channel}`;
  }

  // ─── IRealtimeService Implementation ─────────────────────────────

  /**
   * Subscribe to a real-time channel via Redis list polling.
   *
   * Starts a polling loop that reads new events from the Redis
   * list for the given channel. Only events matching the requested
   * types are forwarded to the callback.
   *
   * @param params - Subscription parameters (channel, types, callback).
   * @returns An unsubscribe function that stops the polling loop.
   */
  subscribe(params: SubscribeParams): () => void {
    const { channel, types, callback } = params;
    const key = this.listKey(channel);
    let active = true;
    let cursor = 0;

    const poll = async () => {
      if (!active) return;

      try {
        const conn = await this.redis.connection(this.connectionName);
        // Read all events from cursor onwards
        const raw = await conn.zrange(key, cursor, -1);

        for (const entry of raw) {
          try {
            const event = JSON.parse(entry) as LiveEvent & { _idx?: number };
            const idx = event._idx ?? 0;

            // Only process events we haven't seen
            if (idx > cursor) {
              cursor = idx;
            }

            // Filter by requested types
            if (types.includes(event.type) || types.includes('*')) {
              callback({
                channel: event.channel,
                type: event.type,
                payload: event.payload,
                date: new Date(event.date),
              });
            }
          } catch {
            /* Skip malformed entries */
          }
        }
      } catch {
        /* Swallow — polling should not throw */
      }

      if (active) {
        setTimeout(poll, this.pollInterval);
      }
    };

    // Start the polling loop
    poll();

    return () => {
      active = false;
    };
  }

  /**
   * Publish an event to a real-time channel.
   *
   * Sends the event via Redis `PUBLISH` for any native subscribers,
   * and also appends it to a sorted set so polling subscribers can
   * pick it up.
   *
   * @param params - Publish parameters (channel, type, payload).
   */
  async publish(params: PublishParams): Promise<void> {
    const conn = await this.redis.connection(this.connectionName);
    const key = this.listKey(params.channel);

    const event: LiveEvent = {
      channel: params.channel,
      type: params.type,
      payload: params.payload,
      date: params.date ?? new Date(),
    };

    const score = Date.now();
    const serialized = JSON.stringify({ ...event, _idx: score });

    // Add to sorted set (score = timestamp for ordering)
    await conn.zadd(key, score, serialized);

    // Trim old events to keep memory bounded
    const total = await conn.zrange(key, 0, -1);
    if (total.length > this.maxEvents) {
      await conn.zremrangebyscore(key, 0, score - this.maxEvents);
    }

    // Also publish via Redis pub/sub for native subscribers
    await conn.publish(params.channel, serialized);
  }
}

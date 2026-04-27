/**
 * @fileoverview Realtime configuration interface for WebSocket connection settings.
 * @module @stackra/ts-realtime
 * @category Interfaces
 */

/**
 * Configuration for the realtime WebSocket connection.
 *
 * Defines all required and optional settings for connecting to a Laravel Broadcasting
 * server via the Pusher protocol. Required fields specify the connection target and
 * authentication endpoint, while optional fields control TLS, clustering, statistics,
 * reconnection behavior, and platform-specific client injection.
 *
 * @description
 * The configuration is passed to `RealtimeModule.forRoot()` which merges it with
 * `defaultRealtimeConfig` so that only required fields and any overrides need to
 * be specified by the consumer.
 *
 * @example
 * ```typescript
 * import { RealtimeModule } from '@stackra/ts-realtime';
 *
 * @Module({
 *   imports: [
 *     RealtimeModule.forRoot({
 *       driver: 'pusher',
 *       key: 'my-app-key',
 *       wsHost: 'ws.example.com',
 *       wsPort: 6001,
 *       authEndpoint: '/broadcasting/auth',
 *       forceTLS: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
export interface RealtimeConfig {
  /** Broadcasting driver. Currently only `'pusher'` is supported. */
  driver: 'pusher';

  /** Pusher/Soketi application key. */
  key: string;

  /** WebSocket host (e.g., `'ws.example.com'`). */
  wsHost: string;

  /** WebSocket port (e.g., `6001`). */
  wsPort: number;

  /** Auth endpoint for private/presence channels (e.g., `'/broadcasting/auth'`). */
  authEndpoint: string;

  /** Force TLS for the WebSocket connection. Default: `false`. */
  forceTLS?: boolean;

  /** Pusher cluster. Default: `'mt1'`. */
  cluster?: string;

  /** Enable encrypted connection. Default: `false`. */
  encrypted?: boolean;

  /** Disable Pusher stats reporting. Default: `true`. */
  disableStats?: boolean;

  /** Additional headers sent with the channel auth request. */
  authHeaders?: Record<string, string>;

  /** Initial delay before the first reconnection attempt in milliseconds. Default: `1000`. */
  reconnectInitialDelay?: number;

  /** Maximum delay between reconnection attempts in milliseconds. Default: `30000`. */
  reconnectMaxDelay?: number;

  /** Multiplier applied to the delay after each failed reconnection attempt. Default: `2`. */
  reconnectMultiplier?: number;

  /**
   * Pre-configured Pusher client instance for environments where the default
   * `pusher-js` import is not suitable (e.g., React Native with
   * `@pusher/pusher-websocket-react-native`).
   */
  client?: any;
}

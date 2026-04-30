/**
 * @fileoverview LaravelEchoConnector — creates EchoConnection instances from config.
 * @module @stackra/ts-realtime
 * @category Connectors
 */

import { Injectable } from '@stackra/ts-container';

import type { RealtimeConnector } from '../interfaces/realtime-connector.interface';
import type { RealtimeConnection } from '../interfaces/realtime-connection.interface';
import type { RealtimeConnectionConfig } from '../interfaces/realtime-connection-config.interface';
import { EchoConnection } from '../connections/echo.connection';

/**
 * Connector factory that creates `EchoConnection` instances backed by Laravel Echo.
 *
 * Validates that required fields (`key`, `wsHost`) are present in the config
 * before creating the connection. Implements the `RealtimeConnector` interface
 * following the same pattern as `UpstashConnector` in `@stackra/ts-redis`.
 *
 * @description
 * Registered by `RealtimeModule.forRoot()` as the default connector via the
 * `REALTIME_CONNECTOR` token. Can be replaced with a custom connector for
 * alternative transports (Socket.IO, Ably, Mock, etc.).
 *
 * @example
 * ```typescript
 * const connector = new LaravelEchoConnector();
 * const connection = await connector.connect({
 *   driver: 'echo',
 *   key: 'my-app-key',
 *   wsHost: 'ws.example.com',
 *   wsPort: 6001,
 * });
 * ```
 */
@Injectable()
export class LaravelEchoConnector implements RealtimeConnector {
  /**
   * Create an EchoConnection from the provided configuration.
   *
   * Validates required fields and creates a connected `EchoConnection`.
   *
   * @param config - The connection configuration
   * @returns A promise resolving to a connected EchoConnection
   * @throws {Error} If `key` is missing
   * @throws {Error} If `wsHost` is missing
   */
  async connect(config: RealtimeConnectionConfig): Promise<RealtimeConnection> {
    if (!config.key) {
      throw new Error('LaravelEchoConnector: Pusher application key is required.');
    }
    if (!config.wsHost) {
      throw new Error('LaravelEchoConnector: WebSocket host is required.');
    }

    const connection = new EchoConnection(config, config.driver);
    connection.connect();
    return connection;
  }
}

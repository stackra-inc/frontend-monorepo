/**
 * @fileoverview RealtimeManager — manages multiple named realtime connections.
 * @module @stackra/ts-realtime
 * @category Services
 */

import { Injectable, Inject, type OnModuleInit, type OnModuleDestroy } from '@stackra/ts-container';
import { MultipleInstanceManager } from '@stackra/ts-support';

import type { RealtimeConnection } from '../interfaces/realtime-connection.interface';
import type { RealtimeConnector } from '../interfaces/realtime-connector.interface';
import type { RealtimeConfig } from '../interfaces/realtime-config.interface';
import type { RealtimeConnectionConfig } from '../interfaces/realtime-connection-config.interface';
import { REALTIME_CONFIG, REALTIME_CONNECTOR } from '../constants/tokens.constant';

/**
 * RealtimeManager — the single entry point for realtime connections in your app.
 *
 * Manages multiple named realtime connections. Each connection is lazily
 * resolved via the configured connector, cached, and reused.
 *
 * Extends `MultipleInstanceManager<RealtimeConnection>` and uses the
 * async resolution path (`instanceAsync` / `createDriverAsync`) since
 * WebSocket connections require async initialization.
 *
 * Lifecycle:
 * - `OnModuleInit` — eagerly warms the default connection
 * - `OnModuleDestroy` — disconnects all active connections
 *
 * @example
 * ```typescript
 * @Injectable()
 * class ChatService {
 *   constructor(@Inject(RealtimeManager) private realtime: RealtimeManager) {}
 *
 *   async subscribeToMessages() {
 *     const conn = await this.realtime.connection('main');
 *     conn.channel('messages')
 *       .listen<MessageEvent>('.message.sent', (data) => {
 *         console.log('New message:', data.text);
 *       });
 *   }
 * }
 * ```
 */
@Injectable()
export class RealtimeManager
  extends MultipleInstanceManager<RealtimeConnection>
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * @param config - Realtime configuration with named connections
   * @param connector - Connector used to create realtime connections
   */
  constructor(
    @Inject(REALTIME_CONFIG) private readonly config: RealtimeConfig,
    @Inject(REALTIME_CONNECTOR) private readonly connector: RealtimeConnector
  ) {
    super();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Lifecycle hooks
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Eagerly warm the default connection on bootstrap.
   *
   * Skips silently if no connections are defined.
   * Logs a warning if the default connection fails to warm.
   */
  public async onModuleInit(): Promise<void> {
    const defaultName = this.config.default;
    if (this.config.connections[defaultName]) {
      try {
        await this.connection();
      } catch (err) {
        console.warn(
          `[RealtimeManager] Failed to warm default connection '${defaultName}':`,
          (err as Error).message
        );
      }
    }
  }

  /**
   * Disconnect all active connections on shutdown.
   */
  public async onModuleDestroy(): Promise<void> {
    await this.disconnectAll();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MultipleInstanceManager contract
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get the default instance name from configuration.
   */
  public getDefaultInstance(): string {
    return this.config.default;
  }

  /**
   * Set the default instance name at runtime.
   */
  public setDefaultInstance(name: string): void {
    (this.config as any).default = name;
  }

  /**
   * Get the configuration for a specific connection.
   *
   * Ensures the returned config includes a `driver` field so the base
   * class's `resolveAsync()` can find it.
   *
   * @param name - The connection name
   * @returns The connection configuration, or undefined if not found
   */
  public getInstanceConfig(name: string): Record<string, any> | undefined {
    const connectionConfig = this.config.connections[name];
    if (!connectionConfig) return undefined;

    return { ...connectionConfig };
  }

  /**
   * Sync driver creation — not used for realtime.
   *
   * Realtime always uses the async path via `createDriverAsync()`.
   *
   * @throws {Error} Always throws; use `connection()` for async resolution
   */
  protected createDriver(_driver: string, _config: Record<string, any>): RealtimeConnection {
    throw new Error('RealtimeManager: use connection() for async resolution.');
  }

  /**
   * Async driver creation — creates a realtime connection via the connector.
   *
   * Called by the base class's `instanceAsync()` when no cached
   * instance exists.
   *
   * @param _driver - The driver name (unused, connector handles it)
   * @param config - The connection configuration
   * @returns A promise resolving to the created RealtimeConnection
   */
  protected async createDriverAsync(
    _driver: string,
    config: Record<string, any>
  ): Promise<RealtimeConnection> {
    return this.connector.connect(config as RealtimeConnectionConfig);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API — Connection management
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get a realtime connection by name.
   *
   * Connections are lazily created and cached. The first call for a
   * given name creates the connection via the connector. Subsequent
   * calls return the cached connection instantly.
   *
   * @param name - Connection name from config. Uses default if omitted.
   * @returns A promise resolving to the RealtimeConnection
   */
  public async connection(name?: string): Promise<RealtimeConnection> {
    return this.instanceAsync(name);
  }

  /**
   * Disconnect a specific connection and remove it from cache.
   *
   * @param name - Connection name. Uses default if omitted.
   */
  public async disconnect(name?: string): Promise<void> {
    const connectionName = name ?? this.config.default;

    if (this.hasInstance(connectionName)) {
      const conn = this.instance(connectionName);
      conn.disconnect();
      this.forgetInstance(connectionName);
    }
  }

  /**
   * Disconnect all active connections and clear the cache.
   */
  public async disconnectAll(): Promise<void> {
    const names = this.getResolvedInstances();
    await Promise.all(names.map((n) => this.disconnect(n)));
    this.purge();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API — Introspection
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all configured connection names (from config).
   */
  public getConnectionNames(): string[] {
    return Object.keys(this.config.connections);
  }

  /**
   * Get the default connection name.
   */
  public getDefaultConnectionName(): string {
    return this.config.default;
  }

  /**
   * Check if a connection has been resolved and is currently cached.
   *
   * @param name - Connection name. Uses default if omitted.
   */
  public isConnectionActive(name?: string): boolean {
    return this.hasInstance(name ?? this.config.default);
  }

  /**
   * Get all active (cached) connection names.
   */
  public getActiveConnectionNames(): string[] {
    return this.getResolvedInstances();
  }
}

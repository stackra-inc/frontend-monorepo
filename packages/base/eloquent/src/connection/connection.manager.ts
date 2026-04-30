/**
 * @file connection.manager.ts
 * @description Config-driven factory and cache for database connections.
 * The ConnectionManager accepts a {@link ConnectionConfig} object at
 * construction time and lazily creates {@link Connection} instances as
 * they are requested via `connection(name?)`.
 *
 * Created connections are cached so that repeated calls with the same
 * name return the identical instance. Closing a connection removes it
 * from the cache so the next request will create a fresh one.
 *
 * RxDB database creation is handled internally via `createRxDatabase()`
 * with the appropriate storage adapter selected by the driver field in
 * the connection definition.
 */

import { createRxDatabase } from 'rxdb';
import type { RxDatabase } from 'rxdb';
import { Connection } from './connection';
import type { ConnectionConfig, ConnectionDefinition, DriverType } from './connection.types';
import { ConnectionNotConfiguredError } from '@/errors/connection-not-configured.error';

// ---------------------------------------------------------------------------
// Storage adapter helpers
// ---------------------------------------------------------------------------

/**
 * Dynamically resolve the RxDB storage adapter for the given driver type.
 *
 * Each driver maps to a specific RxDB storage plugin:
 * - `memory`         → `getRxStorageMemory()`
 * - `indexeddb`      → `getRxStorageDexie()`
 * - `localstorage`   → `getRxStorageLocalstorage()` (falls back to memory)
 * - `sessionstorage` → `getRxStorageSessionstorage()` (falls back to memory)
 *
 * Storage imports are dynamic so that unused adapters are not bundled.
 * Cloud sync (Supabase, etc.) is handled via the replication layer,
 * not via storage drivers.
 *
 * @param driver - The driver identifier from the connection definition
 * @returns An RxDB storage instance suitable for `createRxDatabase()`
 */
async function resolveStorage(driver: DriverType): Promise<any> {
  switch (driver) {
    case 'memory': {
      // In-memory storage — ideal for tests and ephemeral data.
      const { getRxStorageMemory } = await import('rxdb/plugins/storage-memory');
      return getRxStorageMemory();
    }

    case 'indexeddb': {
      // Dexie-backed IndexedDB — the most common browser storage.
      const { getRxStorageDexie } = await import('rxdb/plugins/storage-dexie');
      return getRxStorageDexie();
    }

    case 'localstorage': {
      // localStorage adapter — persistent but limited to ~5 MB.
      // RxDB provides this via the storage-localstorage plugin.
      // Falls back to memory if the plugin is not available.
      try {
        const mod = await import('rxdb/plugins/storage-localstorage');
        return (mod as any).getRxStorageLocalstorage();
      } catch {
        // Fallback: use memory storage when the localStorage plugin
        // is not installed. This keeps the package functional in
        // environments where localStorage is unavailable.
        const { getRxStorageMemory } = await import('rxdb/plugins/storage-memory');
        return getRxStorageMemory();
      }
    }

    case 'sessionstorage': {
      // sessionStorage adapter — same as localStorage but scoped to
      // the browser session. Falls back to memory if unavailable.
      try {
        const mod = await import('rxdb/plugins/storage-localstorage');
        return (
          (mod as any).getRxStorageSessionstorage?.() ?? (mod as any).getRxStorageLocalstorage()
        );
      } catch {
        const { getRxStorageMemory } = await import('rxdb/plugins/storage-memory');
        return getRxStorageMemory();
      }
    }

    default: {
      // Exhaustiveness guard — TypeScript narrows `driver` to `never` here.
      const _exhaustive: never = driver;
      throw new Error(`Unsupported driver: ${_exhaustive}`);
    }
  }
}

// ---------------------------------------------------------------------------
// ConnectionManager class
// ---------------------------------------------------------------------------

/**
 * Config-driven manager that creates, caches, and tears down database
 * connections. Each connection wraps an `RxDatabase` instance bound to
 * the storage adapter specified by its driver.
 *
 * @example
 * ```ts
 * const manager = new ConnectionManager({
 *   default: 'local',
 *   connections: {
 *     local: { driver: 'memory', name: 'app-db' },
 *   },
 * });
 *
 * const conn = await manager.connection();       // uses default
 * const same = await manager.connection('local'); // same cached instance
 * await manager.closeAll();
 * ```
 */
export class ConnectionManager {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /** The full configuration object provided at construction time. */
  private readonly config: ConnectionConfig;

  /**
   * Cache of active connections keyed by connection name.
   * Ensures that `connection(name)` returns the same instance on
   * repeated calls until the connection is explicitly closed.
   */
  private readonly connections: Map<string, Connection> = new Map();

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * @param config - Top-level connection configuration containing a
   *                 default name and a map of connection definitions.
   */
  constructor(config: ConnectionConfig) {
    this.config = config;
  }

  // -------------------------------------------------------------------------
  // Public methods
  // -------------------------------------------------------------------------

  /**
   * Get or create a named connection.
   *
   * If `name` is omitted the default connection name from the config is
   * used. If a connection with the resolved name already exists in the
   * cache it is returned immediately. Otherwise a new `RxDatabase` is
   * created with the appropriate storage adapter and wrapped in a
   * {@link Connection}.
   *
   * @param name - Optional connection name. Defaults to `config.default`.
   * @returns A cached or newly created Connection instance.
   * @throws {ConnectionNotConfiguredError} If the resolved name does not
   *         exist in the configuration's `connections` map.
   */
  async connection(name?: string): Promise<Connection> {
    // Resolve the connection name, falling back to the configured default.
    const resolvedName = name ?? this.config.default;

    // Return the cached instance if one exists for this name.
    const cached = this.connections.get(resolvedName);
    if (cached) {
      return cached;
    }

    // Look up the connection definition in the config map.
    const definition = this.config.connections[resolvedName];
    if (!definition) {
      throw new ConnectionNotConfiguredError(resolvedName);
    }

    // Create a new RxDatabase with the resolved storage adapter.
    const conn = await this.createConnection(resolvedName, definition);

    // Cache the connection for future lookups.
    this.connections.set(resolvedName, conn);

    return conn;
  }

  /**
   * Close a specific named connection and remove it from the cache.
   *
   * After closing, the next call to `connection(name)` will create a
   * fresh RxDatabase instance.
   *
   * @param name - The connection name to close.
   */
  async close(name: string): Promise<void> {
    const conn = this.connections.get(name);
    if (conn) {
      // Remove from cache first so concurrent callers don't get a
      // closing / closed connection.
      this.connections.delete(name);
      await conn.close();
    }
  }

  /**
   * Close every active connection and clear the cache entirely.
   */
  async closeAll(): Promise<void> {
    // Collect all close promises so connections shut down in parallel.
    const closePromises: Promise<void>[] = [];

    for (const [connectionName, conn] of this.connections) {
      this.connections.delete(connectionName);
      closePromises.push(conn.close());
    }

    await Promise.all(closePromises);
  }

  /**
   * Return the default connection name from the configuration.
   *
   * @returns The value of `config.default`.
   */
  getDefaultConnectionName(): string {
    return this.config.default;
  }

  /**
   * Return the connection definition for a given name.
   *
   * Used by the ModelRegistry to check if a connection has replication
   * config and set up sync after collections are created.
   *
   * @param name - The connection name. Defaults to `config.default`.
   * @returns The ConnectionDefinition, or `undefined` if not found.
   */
  getConnectionDefinition(name?: string): ConnectionDefinition | undefined {
    const resolvedName = name ?? this.config.default;
    return this.config.connections[resolvedName];
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Create a new {@link Connection} by instantiating an RxDatabase with
   * the storage adapter dictated by the connection definition's driver.
   *
   * @param name       - Logical connection name (cache key)
   * @param definition - The connection definition from config
   * @returns A fully initialised Connection instance
   */
  private async createConnection(
    name: string,
    definition: ConnectionDefinition
  ): Promise<Connection> {
    // Resolve the storage adapter for the specified driver.
    const storage = await resolveStorage(definition.driver);

    // Create the RxDatabase. The `name` field in the definition is used
    // as the database name in RxDB (distinct from the connection name
    // which is the key in the config map).
    const database: RxDatabase = await createRxDatabase({
      name: definition.name,
      storage,
      multiInstance: definition.multiInstance ?? true,
      eventReduce: definition.eventReduce ?? true,
    });

    // Wrap the database in a Connection with the correct driver tag.
    return new Connection(name, definition.driver, database);
  }
}

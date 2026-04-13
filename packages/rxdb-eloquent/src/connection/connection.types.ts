/**
 * @file connection.types.ts
 * @description Type definitions for the connection layer. Defines the
 * configuration shape accepted by ConnectionManager, the per-connection
 * definition (driver, name, replication options), the supported driver
 * identifiers, and the options bag passed when registering a new
 * RxDB collection on a Connection.
 */

// ---------------------------------------------------------------------------
// Driver Types
// ---------------------------------------------------------------------------

/**
 * Supported local storage driver identifiers.
 *
 * All drivers store data on the client device. Cloud sync is handled
 * separately via the optional `replication` config on each connection.
 *
 * - `'indexeddb'`      — Dexie-backed IndexedDB storage (most common for browsers)
 * - `'memory'`         — In-memory (non-persistent, ideal for tests)
 * - `'localstorage'`   — Browser localStorage adapter (~5 MB limit)
 * - `'sessionstorage'` — Browser sessionStorage adapter (cleared on tab close)
 */
export type DriverType =
  | 'indexeddb'
  | 'memory'
  | 'localstorage'
  | 'sessionstorage';

// ---------------------------------------------------------------------------
// Replication Types
// ---------------------------------------------------------------------------

/**
 * Supported replication provider identifiers.
 *
 * - `'supabase'` — Supabase (PostgreSQL) via `rxdb/plugins/replication-supabase`
 *
 * More providers (Firestore, custom HTTP, etc.) can be added here.
 */
export type ReplicationProvider = 'supabase';

/**
 * Configuration for Supabase pull replication.
 */
export interface SupabasePullConfig {
  /** Number of documents to pull per batch. @default 50 */
  batchSize?: number;
}

/**
 * Configuration for Supabase push replication.
 */
export interface SupabasePushConfig {
  /** Number of documents to push per batch. @default 50 */
  batchSize?: number;
}

/**
 * Replication configuration attached to a connection definition.
 *
 * When present, after RxDB collections are created on this connection,
 * the ModelRegistry will attach `replicateSupabase()` to each collection
 * to enable two-way sync with the remote backend.
 *
 * The local RxDB database (IndexedDB, memory, etc.) is always the source
 * of truth for reads/writes. Replication runs in the background.
 *
 * @example
 * ```ts
 * const config: ReplicationConfig = {
 *   provider: 'supabase',
 *   url: 'https://xyz.supabase.co',
 *   apiKey: 'eyJ...',
 *   live: true,
 *   pull: { batchSize: 50 },
 *   push: { batchSize: 50 },
 * };
 * ```
 */
export interface ReplicationConfig {
  /** The replication provider to use. */
  provider: ReplicationProvider;

  /** Remote connection URL (required for Supabase). */
  url: string;

  /** API key for authentication (required for Supabase — use the anon key). */
  apiKey: string;

  /**
   * Whether replication should stay active and stream live changes.
   * When `true`, uses Supabase Realtime for live updates.
   * @default true
   */
  live?: boolean;

  /** Pull (server → client) configuration. */
  pull?: SupabasePullConfig;

  /** Push (client → server) configuration. */
  push?: SupabasePushConfig;

  /**
   * The column name used by Supabase to track modification timestamps.
   * @default '_modified'
   */
  modifiedField?: string;

  /**
   * The column name used by Supabase to track soft-deleted rows.
   * @default '_deleted'
   */
  deletedField?: string;
}

// ---------------------------------------------------------------------------
// Connection Definition
// ---------------------------------------------------------------------------

/**
 * Configuration for a single named database connection.
 *
 * Each definition maps to one `RxDatabase` instance created by the
 * ConnectionManager. The `driver` field determines which RxDB storage
 * adapter is used. The optional `replication` field enables cloud sync.
 *
 * @example
 * ```ts
 * // Pure local — no sync
 * { driver: 'indexeddb', name: 'myapp' }
 *
 * // Local + Supabase sync
 * {
 *   driver: 'indexeddb',
 *   name: 'myapp',
 *   replication: {
 *     provider: 'supabase',
 *     url: 'https://xyz.supabase.co',
 *     apiKey: 'eyJ...',
 *     live: true,
 *   },
 * }
 * ```
 */
export interface ConnectionDefinition {
  /** Local storage driver to use for this connection. */
  driver: DriverType;

  /** Logical name for the RxDatabase instance (used as the DB name in RxDB). */
  name: string;

  /** Driver-specific options forwarded to the storage adapter constructor. */
  options?: Record<string, any>;

  /**
   * Optional replication configuration. When present, collections on this
   * connection will be synced with the remote backend after creation.
   */
  replication?: ReplicationConfig;

  /**
   * Whether the RxDatabase supports multiple browser tabs / instances.
   * @default true
   */
  multiInstance?: boolean;

  /**
   * Whether RxDB's EventReduce algorithm is enabled for this database.
   * @default true
   */
  eventReduce?: boolean;
}

// ---------------------------------------------------------------------------
// Connection Config
// ---------------------------------------------------------------------------

/**
 * Top-level configuration object accepted by the ConnectionManager.
 *
 * Contains a `default` connection name and a map of named connection
 * definitions. The manager lazily creates and caches `Connection`
 * instances as they are requested.
 *
 * @example
 * ```ts
 * const config: ConnectionConfig = {
 *   default: 'local',
 *   connections: {
 *     local: { driver: 'indexeddb', name: 'app-db' },
 *     synced: {
 *       driver: 'indexeddb',
 *       name: 'app-synced',
 *       replication: {
 *         provider: 'supabase',
 *         url: 'https://xyz.supabase.co',
 *         apiKey: 'eyJ...',
 *       },
 *     },
 *   },
 * };
 * ```
 */
export interface ConnectionConfig {
  /** Name of the connection to use when none is explicitly specified. */
  default: string;

  /** Map of connection name → connection definition. */
  connections: Record<string, ConnectionDefinition>;
}

// ---------------------------------------------------------------------------
// Collection Options
// ---------------------------------------------------------------------------

/**
 * Optional settings passed to `Connection.addCollection()` when
 * registering a new RxDB collection on an existing database.
 *
 * These map directly to the options accepted by
 * `RxDatabase.addCollections()`.
 */
export interface CollectionOptions {
  /**
   * Migration strategies keyed by schema version number.
   * Each function receives the old document and returns the migrated document.
   */
  migrationStrategies?: Record<number, (oldDoc: any) => any>;

  /** Whether to automatically run migrations when the collection is created. */
  autoMigrate?: boolean;

  /** Instance methods added to every RxDocument in this collection. */
  methods?: Record<string, Function>;

  /** Static methods added to the RxCollection itself. */
  statics?: Record<string, Function>;
}

/**
 * @file connection.ts
 * @description Wraps a single RxDB `RxDatabase` instance together with
 * its associated driver type and grammar implementations. The Connection
 * class is the primary interface through which the rest of the package
 * interacts with the underlying database — retrieving collections,
 * registering new collection schemas, and tearing down the database.
 *
 * All drivers are local storage engines (IndexedDB, memory, localStorage,
 * sessionStorage). Cloud sync is handled separately via the replication
 * layer — see {@link ReplicationConfig} in `connection.types.ts`.
 */

import type { RxCollection, RxDatabase, RxJsonSchema } from 'rxdb';
import type { DriverType, CollectionOptions, ReplicationConfig } from './connection.types';
import { RxDBSchemaGrammar } from '@/schema/grammars/rxdb-schema.grammar';

// ---------------------------------------------------------------------------
// Connection class
// ---------------------------------------------------------------------------

/**
 * A single database connection wrapping an `RxDatabase` instance and its
 * associated storage driver.
 *
 * Instances are created by the {@link ConnectionManager} — consumers
 * should not construct `Connection` objects directly.
 *
 * @example
 * ```ts
 * const conn = await manager.connection('local');
 * const users = conn.getCollection('users');
 * await conn.close();
 * ```
 */
export class Connection {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /** Logical name of this connection (matches the key in ConnectionConfig). */
  readonly name: string;

  /** Storage driver identifier for this connection. */
  readonly driver: DriverType;

  /**
   * The underlying RxDB database instance.
   * Exposed as a read-only property so advanced consumers can access
   * RxDB APIs directly (escape hatch).
   */
  readonly database: RxDatabase;

  /**
   * Active replication states keyed by collection name.
   * Populated by `setupReplication()` when a connection has replication config.
   * @internal
   */
  private readonly _replications: Map<string, any> = new Map();

  /**
   * Cached Supabase client instance, shared across all collections on this
   * connection. Created lazily on the first `setupReplication()` call to
   * avoid the "Multiple GoTrueClient instances" warning.
   * @internal
   */
  private _supabaseClient: any = null;

  /**
   * Schema grammar used to compile Blueprints into the target schema
   * format (RxJsonSchema for local drivers).
   *
   * Typed as `any` until grammar classes are fully wired.
   * Will be `RxDBSchemaGrammar` for all local drivers.
   */
  readonly schemaGrammar: any;

  /**
   * Query grammar used to compile QueryBuilder state into executable
   * queries (Mango selectors for local drivers).
   *
   * Typed as `any` until grammar classes are fully wired.
   * Will be `MangoQueryGrammar` for all local drivers.
   */
  readonly queryGrammar: any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new Connection wrapping the given RxDatabase.
   *
   * @param name     - Logical connection name
   * @param driver   - Storage driver identifier
   * @param database - An already-created RxDatabase instance
   */
  constructor(name: string, driver: DriverType, database: RxDatabase) {
    this.name = name;
    this.driver = driver;
    this.database = database;
    this.schemaGrammar = new RxDBSchemaGrammar();
    this.queryGrammar = null;
  }

  // -------------------------------------------------------------------------
  // Public methods
  // -------------------------------------------------------------------------

  /**
   * Retrieve an existing RxCollection by name from the underlying database.
   *
   * @param name - The collection name to look up
   * @returns The RxCollection instance
   * @throws {Error} If no collection with the given name exists on this database
   */
  getCollection(name: string): RxCollection {
    const collection = this.database.collections[name];

    if (!collection) {
      throw new Error(`Collection "${name}" does not exist on database "${this.name}".`);
    }

    return collection!;
  }

  /**
   * Register a new collection schema on the underlying RxDatabase.
   *
   * @param name    - Collection name
   * @param schema  - A valid RxJsonSchema describing the collection
   * @param options - Optional collection settings (migration strategies, methods, etc.)
   * @returns The newly created RxCollection
   */
  async addCollection(
    name: string,
    schema: RxJsonSchema<any>,
    options?: CollectionOptions
  ): Promise<RxCollection> {
    const collectionCreator: {
      schema: RxJsonSchema<any>;
      migrationStrategies?: Record<number, (oldDoc: any) => any>;
      autoMigrate?: boolean;
      methods?: Record<string, Function>;
      statics?: Record<string, Function>;
    } = { schema };

    if (options?.migrationStrategies) {
      collectionCreator.migrationStrategies = options.migrationStrategies;
    }
    if (options?.autoMigrate !== undefined) {
      collectionCreator.autoMigrate = options.autoMigrate;
    }
    if (options?.methods) {
      collectionCreator.methods = options.methods;
    }
    if (options?.statics) {
      collectionCreator.statics = options.statics;
    }

    const collections = await this.database.addCollections({
      [name]: collectionCreator as any,
    });

    return collections[name]!;
  }

  /**
   * Set up Supabase replication for a specific collection on this connection.
   *
   * Uses RxDB's `replicateSupabase()` plugin to enable two-way sync
   * between the local RxDB collection and a Supabase (Postgres) table.
   *
   * The table name in Supabase is assumed to match the collection name.
   *
   * @param collectionName - The collection to replicate
   * @param config         - The replication configuration
   * @returns The replication state (for error observation, cancellation, etc.)
   */
  async setupReplication(collectionName: string, config: ReplicationConfig): Promise<any> {
    const collection = this.getCollection(collectionName);

    if (config.provider === 'supabase') {
      try {
        // Dynamic imports — @supabase/supabase-js is an optional peer dependency.
        // Using direct string literals so bundlers (Vite, webpack) can resolve them.
        // If @supabase/supabase-js is not installed, the import will throw and
        // we gracefully fall back to local-only mode.
        const { createClient } = await import('@supabase/supabase-js');
        const { replicateSupabase } = await import('rxdb/plugins/replication-supabase');

        // Reuse existing Supabase client or create one for this connection
        if (!this._supabaseClient) {
          this._supabaseClient = createClient(config.url, config.apiKey);
        }
        const supabaseClient = this._supabaseClient;

        // Build replication options
        const replicationOptions: any = {
          replicationIdentifier: `${this.name}-${collectionName}`,
          collection,
          client: supabaseClient,
          tableName: collectionName,
          live: config.live ?? true,
          pull: config.pull ? { batchSize: config.pull.batchSize ?? 50 } : {},
          push: config.push ? { batchSize: config.push.batchSize ?? 50 } : {},
          ...(config.modifiedField ? { modifiedField: config.modifiedField } : {}),
          ...(config.deletedField ? { deletedField: config.deletedField } : {}),
        };

        // Start replication
        const replicationState = replicateSupabase(replicationOptions);

        // Log replication errors
        replicationState.error$.subscribe((err: any) => {
          console.error(`[Connection] Replication error for "${collectionName}":`, err);
        });

        // Cache the replication state
        this._replications.set(collectionName, replicationState);

        return replicationState;
      } catch (err) {
        console.warn(
          `[Connection] setupReplication() — FAILED for "${collectionName}":`,
          (err as Error).message
        );
        console.warn(
          '[Connection] Make sure @supabase/supabase-js is installed: pnpm add @supabase/supabase-js'
        );
        // Don't throw — replication failure shouldn't prevent local operations
        return null;
      }
    }

    return null;
  }

  /**
   * Get the active replication state for a collection, if any.
   *
   * @param collectionName - The collection name
   * @returns The replication state, or `undefined` if not replicated
   */
  getReplication(collectionName: string): any | undefined {
    return this._replications.get(collectionName);
  }

  /**
   * Cancel all active replications and close the underlying RxDatabase.
   */
  async close(): Promise<void> {
    // Cancel all active replications first
    for (const [, replication] of this._replications) {
      try {
        if (replication && typeof replication.cancel === 'function') {
          await replication.cancel();
        }
      } catch {
        // Ignore cancellation errors during shutdown
      }
    }
    this._replications.clear();

    await this.database.close();
  }
}

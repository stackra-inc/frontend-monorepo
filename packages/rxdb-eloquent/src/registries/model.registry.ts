/**
 * @file model.registry.ts
 * @description Central registry for all Model classes in the application.
 *
 * Extends `BaseRegistry` from `@abdokouta/ts-support`. Implements
 * `OnModuleInit` so that when the DI container finishes bootstrapping,
 * all registered models are automatically booted:
 *
 * 1. Resolves each Model's schema via SchemaResolver (decorator metadata → RxJsonSchema)
 * 2. Creates the corresponding RxDB collection on the Connection
 *
 * This follows the same pattern as `CacheManager.onModuleInit()` in
 * `@abdokouta/ts-cache`.
 *
 * @example
 * ```ts
 * // No manual boot() needed — onModuleInit() handles it automatically
 * // when the DI container starts via ApplicationContext.create(AppModule)
 * ```
 */

import { Injectable, Inject, type OnModuleInit, type OnModuleDestroy } from '@abdokouta/ts-container';
import { BaseRegistry } from '@abdokouta/ts-support';
import { ConnectionManager } from '../connection/connection.manager';
import { SchemaResolver } from '../schema/schema.resolver';
import { MetadataStorage } from '../metadata/metadata.storage';
import { Model } from '../model/model';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A Model class constructor (the static side of a Model).
 */
export type ModelClass = Function & {
  collection?: string;
  connection?: string;
  getCollectionName?: () => string;
  getConnectionName?: () => string;
  setConnectionManager?: (manager: ConnectionManager) => void;
};

// ---------------------------------------------------------------------------
// ModelRegistry
// ---------------------------------------------------------------------------

/**
 * Stores Model classes keyed by collection name.
 *
 * Implements `OnModuleInit` — when the DI container boots, `onModuleInit()`
 * automatically resolves schemas and creates RxDB collections for all
 * registered models. No manual `boot()` call needed.
 *
 * Implements `OnModuleDestroy` — closes all connections on shutdown.
 */
@Injectable()
export class ModelRegistry
  extends BaseRegistry<ModelClass>
  implements OnModuleInit, OnModuleDestroy
{
  /** Whether boot() has completed. */
  private booted = false;

  /** Collection names that have been created on the RxDB database. */
  private readonly bootedCollections = new Set<string>();

  constructor(
    @Inject(ConnectionManager) private readonly connectionManager: ConnectionManager,
    @Inject(SchemaResolver) private readonly schemaResolver: SchemaResolver,
  ) {
    super();
  }

  // -----------------------------------------------------------------------
  // Lifecycle — OnModuleInit
  // -----------------------------------------------------------------------

  /**
   * Called automatically by the DI container after all providers are resolved.
   *
   * Wires the ConnectionManager into the Model base class, then boots all
   * registered models (resolves schemas → creates RxDB collections).
   *
   * This is the same pattern as `CacheManager.onModuleInit()`.
   */
  /**
   * Called automatically by the DI container after all providers are resolved.
   *
   * 1. Drains the static pending queues from EloquentModule.forFeature()
   * 2. Wires the ConnectionManager into the Model base class
   * 3. Boots all registered models (resolves schemas → creates RxDB collections)
   */
  async onModuleInit(): Promise<void> {
    // Import EloquentModule to access the static pending queues.
    // Dynamic import avoids circular dependency at module level.
    const { EloquentModule } = await import('../eloquent.module');

    // Drain pending models from forFeature() calls
    if (EloquentModule.pendingModels.length > 0) {
      this.registerMany(EloquentModule.pendingModels);
      EloquentModule.pendingModels.length = 0; // clear the queue
    }

    // Wire ConnectionManager into the static Model class so that
    // Model.find(), Model.create(), model.save(), etc. can resolve
    // connections without DI injection.
    Model.setConnectionManager(this.connectionManager);

    // Boot all registered models
    await this.boot();

    // Drain and run pending seeders if autoSeed is enabled.
    // Only seeds if the first registered collection is empty (first boot).
    if (EloquentModule.autoSeed && EloquentModule.pendingSeeders.length > 0) {
      // Check if the database already has data (skip seeding on subsequent loads)
      let shouldSeed = true;
      const firstCollectionName = [...this.bootedCollections][0];
      if (firstCollectionName) {
        try {
          const connName = this.connectionManager.getDefaultConnectionName();
          const conn = await this.connectionManager.connection(connName);
          const collection = conn.getCollection(firstCollectionName);
          const count = await collection.count().exec();
          if (count > 0) {
            shouldSeed = false;
          }
        } catch {
          // If we can't check, seed anyway
        }
      }

      if (shouldSeed) {
        const { SeederRegistry } = await import('./seeder.registry');
        const seederRegistry = new SeederRegistry();
        seederRegistry.addMany(EloquentModule.pendingSeeders);
        await seederRegistry.seed();
      }

      EloquentModule.pendingSeeders.length = 0;
    }

  }

  /**
   * Called on application shutdown. Closes all database connections.
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.connectionManager.closeAll();
    } catch {
      // Silently ignore close errors during shutdown
    }
  }

  // -----------------------------------------------------------------------
  // Registration
  // -----------------------------------------------------------------------

  /**
   * Register a single Model class.
   * Reads collection name from @Collection metadata or static property.
   */
  /**
   * Register a single Model class.
   * Reads collection name from @Collection metadata or static property.
   *
   * If boot() has already run (onModuleInit completed), we immediately
   * boot this model so late-registered models still get their collections
   * created.
   */
  registerModel(modelClass: ModelClass): void {
    const name = this.resolveCollectionName(modelClass);
    this.register(name, modelClass);

    // If boot() already ran (onModuleInit completed), boot this model now
    if (this.booted) {
      this.bootSingle(name, modelClass).catch((err) => {
        console.warn(`[ModelRegistry] Late boot failed for "${name}":`, (err as Error).message);
      });
    }
  }

  /**
   * Register multiple Model classes at once.
   */
  registerMany(models: ModelClass[]): void {
    for (const model of models) {
      this.registerModel(model);
    }
  }

  // -----------------------------------------------------------------------
  // Boot — resolve schemas, create collections
  // -----------------------------------------------------------------------

  /**
   * Boot a single model — resolve schema and create RxDB collection.
   * Used for late-registered models (after onModuleInit has already run).
   */
  private async bootSingle(collectionName: string, modelClass: ModelClass): Promise<void> {
    if (this.bootedCollections.has(collectionName)) return;

    try {
      const schema = this.schemaResolver.resolve(modelClass);
      const connectionName = this.resolveConnectionName(modelClass);
      const connection = await this.connectionManager.connection(connectionName);
      await connection.addCollection(collectionName, schema);
      this.bootedCollections.add(collectionName);

      // Set up replication if the connection has replication config
      const definition = this.connectionManager.getConnectionDefinition(connectionName);
      if (definition?.replication) {
        await connection.setupReplication(collectionName, definition.replication);
      }
    } catch (err) {
      console.warn(`[ModelRegistry] bootSingle() failed for "${collectionName}":`, (err as Error).message);
    }
  }

  // -----------------------------------------------------------------------
  // Boot — resolve schemas, create collections
  // -----------------------------------------------------------------------

  /**
   * Boot all registered models.
   *
   * For each registered Model class:
   * 1. Resolves the RxJsonSchema via SchemaResolver
   * 2. Gets the Connection for the model
   * 3. Creates the RxDB collection via Connection.addCollection()
   *
   * Safe to call multiple times — already-booted collections are skipped.
   */
  async boot(): Promise<void> {
    const entries = this.getAsRecord();

    for (const [collectionName, modelClass] of Object.entries(entries)) {
      if (this.bootedCollections.has(collectionName)) {
        continue;
      }

      try {
        const schema = this.schemaResolver.resolve(modelClass);

        const connectionName = this.resolveConnectionName(modelClass);

        const connection = await this.connectionManager.connection(connectionName);

        await connection.addCollection(collectionName, schema);
        this.bootedCollections.add(collectionName);

        // Set up replication if the connection has replication config
        const definition = this.connectionManager.getConnectionDefinition(connectionName);
        if (definition?.replication) {
          await connection.setupReplication(collectionName, definition.replication);
        }
      } catch (err) {
        console.warn(
          `[ModelRegistry] Failed to boot "${collectionName}":`,
          (err as Error).message,
        );
      }
    }

    this.booted = true;
  }

  isBooted(): boolean {
    return this.booted;
  }

  getModel(collectionName: string): ModelClass | undefined {
    return this.get(collectionName);
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private resolveCollectionName(modelClass: ModelClass): string {
    const storage = MetadataStorage.getInstance();
    const meta = storage.getMergedClassMetadata(modelClass);
    if (meta.collection) return meta.collection;
    if (typeof modelClass.getCollectionName === 'function') return modelClass.getCollectionName();
    if (modelClass.collection) return modelClass.collection;
    return modelClass.name.toLowerCase();
  }

  private resolveConnectionName(modelClass: ModelClass): string {
    const storage = MetadataStorage.getInstance();
    const meta = storage.getMergedClassMetadata(modelClass);

    // 1. Explicit decorator value
    if (meta.connection) return meta.connection;

    // 2. Explicit static method
    if (typeof modelClass.getConnectionName === 'function') {
      const name = modelClass.getConnectionName();
      if (name && name !== 'default') return name;
    }

    // 3. Explicit static property (non-empty, non-default)
    if (modelClass.connection && modelClass.connection !== 'default') {
      return modelClass.connection;
    }

    // 4. Fall back to the ConnectionManager's configured default
    return this.connectionManager.getDefaultConnectionName();
  }
}

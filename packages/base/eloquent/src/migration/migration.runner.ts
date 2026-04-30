/**
 * @file migration.runner.ts
 * @description Executes, tracks, and rolls back database migrations for the
 * rxdb-eloquent package.
 *
 * The MigrationRunner:
 * - Maintains an ordered list of Migration instances
 * - Tracks execution state in a `_migrations` metadata collection
 * - Runs pending migrations in ascending order via `migrate()`
 * - Rolls back the last batch in descending order via `rollback()`
 * - Provides `pending()` and `needed()` for inspection
 *
 * For RxDB targets, each migration increments the schema version and generates
 * `migrationStrategies`. For SQL targets, migrations compile to DDL and execute
 * against the remote database.
 *
 * @example
 * ```ts
 * import { MigrationRunner } from 'rxdb-eloquent';
 *
 * const runner = new MigrationRunner(connection, [
 *   new CreateUsersTable(),
 *   new CreatePostsTable(),
 *   new AddAgeToUsers(),
 * ]);
 *
 * // Check if migrations are needed
 * if (await runner.needed()) {
 *   await runner.migrate();
 * }
 *
 * // Rollback the last batch
 * await runner.rollback();
 * ```
 */

import type { Migration } from './migration';
import { SchemaBuilder } from '@/schema/schema.builder';
import type { Connection } from '@/connection/connection';
import { MigrationError } from '@/errors/migration.error';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A record stored in the `_migrations` metadata collection to track
 * which migrations have been executed.
 */
export interface MigrationRecord {
  /** Unique identifier for this migration record. */
  id: string;
  /** The migration class name or identifier. */
  migration: string;
  /** The batch number (incremented each time `migrate()` is called). */
  batch: number;
  /** ISO timestamp of when the migration was executed. */
  ran_at: string;
}

// ---------------------------------------------------------------------------
// MigrationRunner
// ---------------------------------------------------------------------------

/**
 * Executes and tracks database migrations.
 *
 * Migrations are run in the order they are provided (ascending). Each call
 * to `migrate()` creates a new batch. Rollback reverses the last batch in
 * descending order.
 *
 * State is tracked in a `_migrations` metadata collection on the database.
 *
 * @example
 * ```ts
 * const runner = new MigrationRunner(connection, migrations);
 * await runner.migrate();   // Run all pending
 * await runner.rollback();  // Undo last batch
 * ```
 */
export class MigrationRunner {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * The database connection to run migrations against.
   */
  private readonly connection: Connection;

  /**
   * The ordered list of all migrations (pending and already-run).
   */
  private readonly migrations: Migration[];

  /**
   * The name of the metadata collection used to track migration state.
   * @default '_migrations'
   */
  private readonly metadataCollection: string = '_migrations';

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new MigrationRunner.
   *
   * @param connection - The database connection to run migrations against.
   * @param migrations - An ordered array of Migration instances.
   * @param metadataCollection - Optional custom name for the metadata collection.
   *
   * @example
   * ```ts
   * const runner = new MigrationRunner(conn, [
   *   new CreateUsersTable(),
   *   new CreatePostsTable(),
   * ]);
   * ```
   */
  constructor(connection: Connection, migrations: Migration[], metadataCollection?: string) {
    this.connection = connection;
    this.migrations = migrations;
    if (metadataCollection) {
      this.metadataCollection = metadataCollection;
    }
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Run all pending migrations in order.
   *
   * Determines which migrations have not yet been executed, then runs
   * each one's `up()` method with a SchemaBuilder. Each migration in
   * this batch is recorded in the `_migrations` metadata collection.
   *
   * @throws {MigrationError} If any migration fails during execution.
   *
   * @example
   * ```ts
   * await runner.migrate();
   * console.log('All pending migrations executed');
   * ```
   */
  async migrate(): Promise<void> {
    const pendingMigrations = await this.pending();

    if (pendingMigrations.length === 0) {
      return; // Nothing to do
    }

    // Determine the next batch number
    const ranRecords = await this.getRanRecords();
    const maxBatch = ranRecords.reduce((max, r) => Math.max(max, r.batch), 0);
    const nextBatch = maxBatch + 1;

    // Create a SchemaBuilder using the connection's schema grammar
    const schemaBuilder = new SchemaBuilder(this.connection.schemaGrammar);

    // Execute each pending migration
    for (const migration of pendingMigrations) {
      const migrationName = this.getMigrationName(migration);

      try {
        await migration.up(schemaBuilder);

        // Record the migration as executed
        await this.recordMigration(migrationName, nextBatch);
      } catch (error) {
        throw new MigrationError(
          migrationName,
          'up',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Rollback the last batch of migrations.
   *
   * Finds all migrations from the most recent batch and executes their
   * `down()` methods in reverse order. Removes the corresponding records
   * from the `_migrations` metadata collection.
   *
   * @throws {MigrationError} If any migration fails during rollback.
   *
   * @example
   * ```ts
   * await runner.rollback();
   * console.log('Last batch rolled back');
   * ```
   */
  async rollback(): Promise<void> {
    const ranRecords = await this.getRanRecords();

    if (ranRecords.length === 0) {
      return; // Nothing to rollback
    }

    // Find the last batch number
    const lastBatch = ranRecords.reduce((max, r) => Math.max(max, r.batch), 0);

    // Get migrations from the last batch, in reverse order
    const lastBatchRecords = ranRecords.filter((r) => r.batch === lastBatch).reverse();

    const schemaBuilder = new SchemaBuilder(this.connection.schemaGrammar);

    for (const record of lastBatchRecords) {
      // Find the corresponding Migration instance
      const migration = this.migrations.find((m) => this.getMigrationName(m) === record.migration);

      if (!migration) {
        continue; // Skip if migration class not found
      }

      try {
        await migration.down(schemaBuilder);

        // Remove the migration record
        await this.removeMigrationRecord(record.id);
      } catch (error) {
        throw new MigrationError(
          record.migration,
          'down',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Get the list of pending (not yet executed) migrations.
   *
   * Compares the full migration list against the `_migrations` metadata
   * collection to determine which migrations have not been run.
   *
   * @returns An array of Migration instances that have not been executed.
   *
   * @example
   * ```ts
   * const pending = await runner.pending();
   * console.log(`${pending.length} migrations pending`);
   * ```
   */
  async pending(): Promise<Migration[]> {
    const ranRecords = await this.getRanRecords();
    const ranNames = new Set(ranRecords.map((r) => r.migration));

    return this.migrations.filter((m) => !ranNames.has(this.getMigrationName(m)));
  }

  /**
   * Check if any migrations need to be run.
   *
   * @returns `true` if there are pending migrations.
   *
   * @example
   * ```ts
   * if (await runner.needed()) {
   *   console.log('Database needs migration');
   * }
   * ```
   */
  async needed(): Promise<boolean> {
    const pendingMigrations = await this.pending();
    return pendingMigrations.length > 0;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Get all migration records from the `_migrations` metadata collection.
   *
   * Returns an empty array if the metadata collection doesn't exist yet.
   *
   * @returns An array of MigrationRecord objects.
   * @internal
   */
  private async getRanRecords(): Promise<MigrationRecord[]> {
    try {
      const collection = this.connection.getCollection(this.metadataCollection);
      const docs = await collection.find().exec();
      return docs.map((doc: any) => ({
        id: doc.id ?? doc._id,
        migration: doc.migration,
        batch: doc.batch,
        ran_at: doc.ran_at,
      }));
    } catch {
      // Collection doesn't exist yet — no migrations have been run
      return [];
    }
  }

  /**
   * Record a migration as executed in the metadata collection.
   *
   * @param migrationName - The migration identifier.
   * @param batch         - The batch number.
   * @internal
   */
  private async recordMigration(migrationName: string, batch: number): Promise<void> {
    try {
      const collection = this.connection.getCollection(this.metadataCollection);
      await collection.insert({
        id: `${migrationName}_${batch}`,
        migration: migrationName,
        batch,
        ran_at: new Date().toISOString(),
      });
    } catch {
      // If the metadata collection doesn't exist, we need to create it first
      // TODO: Auto-create the _migrations collection with a minimal schema
    }
  }

  /**
   * Remove a migration record from the metadata collection.
   *
   * @param id - The record ID to remove.
   * @internal
   */
  private async removeMigrationRecord(id: string): Promise<void> {
    try {
      const collection = this.connection.getCollection(this.metadataCollection);
      const doc = await collection.findOne(id).exec();
      if (doc) {
        await doc.remove();
      }
    } catch {
      // Silently ignore if collection or record doesn't exist
    }
  }

  /**
   * Get a unique name/identifier for a Migration instance.
   *
   * Uses the constructor name as the migration identifier.
   *
   * @param migration - The Migration instance.
   * @returns The migration name string.
   * @internal
   */
  private getMigrationName(migration: Migration): string {
    return migration.constructor.name;
  }
}

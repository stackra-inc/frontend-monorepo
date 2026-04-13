/**
 * @file migration.registry.ts
 * @description Registry for Migration classes. Extends BaseRegistry to store
 * Migration instances keyed by class name.
 *
 * Implements `OnModuleInit` — automatically runs pending migrations when
 * the DI container boots (if `autoMigrate` is enabled on the config).
 *
 * @example
 * ```ts
 * // Migrations run automatically on boot via onModuleInit()
 * // Or manually:
 * await migrationRegistry.migrate();
 * await migrationRegistry.rollback();
 * ```
 */

import { Injectable, Inject, type OnModuleInit } from '@abdokouta/ts-container';
import { BaseRegistry } from '@abdokouta/ts-support';
import type { Migration } from '../migration/migration';
import { MigrationRunner } from '../migration/migration.runner';
import { ConnectionManager } from '../connection/connection.manager';

// ---------------------------------------------------------------------------
// MigrationRegistry
// ---------------------------------------------------------------------------

/**
 * Stores Migration instances keyed by class name.
 * Delegates migrate/rollback to MigrationRunner.
 *
 * Implements `OnModuleInit` — if migrations are registered, checks
 * if any are pending and logs a warning. Auto-migration can be
 * triggered by calling `migrate()` explicitly or enabling autoMigrate.
 */
@Injectable()
export class MigrationRegistry
  extends BaseRegistry<Migration>
  implements OnModuleInit
{
  /** Ordered list preserving registration order. */
  private readonly ordered: Migration[] = [];

  /** Whether to auto-run migrations on boot. */
  private autoMigrate = false;

  constructor(
    @Inject(ConnectionManager) private readonly connectionManager: ConnectionManager,
  ) {
    super();
  }

  /**
   * Enable auto-migration on boot.
   */
  setAutoMigrate(enabled: boolean): void {
    this.autoMigrate = enabled;
  }

  // -----------------------------------------------------------------------
  // Lifecycle — OnModuleInit
  // -----------------------------------------------------------------------

  /**
   * Called by the DI container after all providers are resolved.
   * If autoMigrate is enabled, runs pending migrations automatically.
   */
  async onModuleInit(): Promise<void> {
    if (this.autoMigrate && this.ordered.length > 0) {
      try {
        await this.migrate();
      } catch (err) {
        console.warn(
          '[MigrationRegistry] Auto-migration failed:',
          (err as Error).message,
        );
      }
    }
  }

  // -----------------------------------------------------------------------
  // Registration
  // -----------------------------------------------------------------------

  /**
   * Register a Migration instance.
   */
  override add(_key: string, migration: Migration): void;
  add(migration: Migration): void;
  add(keyOrMigration: string | Migration, maybeMigration?: Migration): void {
    const migration = typeof keyOrMigration === 'string' ? maybeMigration! : keyOrMigration;
    const name = migration.constructor.name;
    this.register(name, migration);
    this.ordered.push(migration);
  }

  /**
   * Register multiple Migration instances from class constructors.
   */
  addClasses(classes: Array<new () => Migration>): void {
    for (const MigrationClass of classes) {
      this.add(new MigrationClass());
    }
  }

  // -----------------------------------------------------------------------
  // Execution
  // -----------------------------------------------------------------------

  /**
   * Run all pending migrations on the default connection.
   */
  async migrate(connectionName?: string): Promise<void> {
    const connection = await this.connectionManager.connection(connectionName);
    const runner = new MigrationRunner(connection, this.ordered);
    await runner.migrate();
  }

  /**
   * Rollback the last batch of migrations.
   */
  async rollback(connectionName?: string): Promise<void> {
    const connection = await this.connectionManager.connection(connectionName);
    const runner = new MigrationRunner(connection, this.ordered);
    await runner.rollback();
  }

  /**
   * Check if any migrations are pending.
   */
  async needed(connectionName?: string): Promise<boolean> {
    const connection = await this.connectionManager.connection(connectionName);
    const runner = new MigrationRunner(connection, this.ordered);
    return runner.needed();
  }

  /**
   * Get all registered migrations in order.
   */
  getOrdered(): Migration[] {
    return [...this.ordered];
  }
}

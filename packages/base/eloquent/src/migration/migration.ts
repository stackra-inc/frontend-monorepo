/**
 * @file migration.ts
 * @description Abstract base class for database migrations in the rxdb-eloquent package.
 *
 * Migrations define schema changes via `up()` and `down()` methods. Each migration
 * receives a {@link SchemaBuilder} instance to define collection schemas using the
 * fluent Blueprint API.
 *
 * For RxDB targets, migrations increment the schema version and generate
 * `migrationStrategies` to transform existing documents. For SQL targets,
 * migrations compile to DDL statements.
 *
 * @example
 * ```ts
 * import { Migration } from 'rxdb-eloquent';
 * import type { SchemaBuilder } from 'rxdb-eloquent';
 *
 * class CreateUsersTable extends Migration {
 *   async up(schema: SchemaBuilder): Promise<void> {
 *     schema.create('users', (table) => {
 *       table.string('id', 100).primary();
 *       table.string('name', 255);
 *       table.string('email', 255);
 *       table.timestamps();
 *     });
 *   }
 *
 *   async down(schema: SchemaBuilder): Promise<void> {
 *     // Drop the users collection
 *     // schema.drop('users');
 *   }
 * }
 * ```
 */

import type { SchemaBuilder } from '@/schema/schema.builder';

// ---------------------------------------------------------------------------
// Abstract Migration
// ---------------------------------------------------------------------------

/**
 * Abstract base class for database migrations.
 *
 * Subclass this to define schema changes. Implement `up()` to apply the
 * migration and `down()` to reverse it.
 *
 * Migrations are executed by the {@link MigrationRunner} in version order.
 * Each migration is tracked in a `_migrations` metadata collection to
 * prevent re-execution.
 *
 * @example
 * ```ts
 * class AddAgeToUsers extends Migration {
 *   async up(schema: SchemaBuilder): Promise<void> {
 *     schema.create('users', (table) => {
 *       table.string('id', 100).primary();
 *       table.string('name', 255);
 *       table.integer('age');
 *       table.timestamps();
 *     });
 *   }
 *
 *   async down(schema: SchemaBuilder): Promise<void> {
 *     // Reverse the migration
 *   }
 * }
 * ```
 */
export abstract class Migration {
  /**
   * Apply the migration.
   *
   * Use the provided SchemaBuilder to create, modify, or drop collections.
   * The SchemaBuilder compiles Blueprints via the configured grammar.
   *
   * @param schema - The SchemaBuilder instance for defining schema changes.
   * @returns A void promise (migrations can be async).
   *
   * @example
   * ```ts
   * async up(schema: SchemaBuilder): Promise<void> {
   *   schema.create('posts', (table) => {
   *     table.string('id', 100).primary();
   *     table.string('title', 255);
   *   });
   * }
   * ```
   */
  abstract up(schema: SchemaBuilder): void | Promise<void>;

  /**
   * Reverse the migration.
   *
   * Use the provided SchemaBuilder to undo the changes made in `up()`.
   * This is called during rollback operations.
   *
   * @param schema - The SchemaBuilder instance for reversing schema changes.
   * @returns A void promise (migrations can be async).
   *
   * @example
   * ```ts
   * async down(schema: SchemaBuilder): Promise<void> {
   *   // Reverse: drop the posts collection
   * }
   * ```
   */
  abstract down(schema: SchemaBuilder): void | Promise<void>;
}

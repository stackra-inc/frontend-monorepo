/**
 * @file migration.error.ts
 * @description Error thrown when a migration's up() or down()
 * method fails during execution. Wraps the original error
 * with context about which migration and direction failed.
 * The MigrationRunner stops execution on this error and
 * does not record the failed migration in the metadata.
 */

/**
 * Thrown when a Migration class's `up()` or `down()` method
 * throws during execution by the MigrationRunner.
 *
 * @example
 * ```ts
 * throw new MigrationError(
 *   'CreateUsersTable',
 *   'up',
 *   originalError
 * );
 * ```
 */
export class MigrationError extends Error {
  /**
   * The identifier (class name or file name) of the migration
   * that failed.
   */
  public readonly migration: string;

  /**
   * Whether the failure occurred during 'up' (forward migration)
   * or 'down' (rollback).
   */
  public readonly direction: 'up' | 'down';

  /**
   * The original error that caused the migration to fail.
   */
  public readonly cause: Error;

  /**
   * @param migration - The migration identifier that failed
   * @param direction - 'up' for forward, 'down' for rollback
   * @param cause - The underlying error from the migration code
   */
  constructor(migration: string, direction: 'up' | 'down', cause: Error) {
    super(`Migration "${migration}" failed during ${direction}: ${cause.message}`);
    this.migration = migration;
    this.direction = direction;
    this.cause = cause;
    Object.setPrototypeOf(this, MigrationError.prototype);
  }
}

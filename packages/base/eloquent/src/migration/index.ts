/**
 * @file migration/index.ts
 * @description Barrel export for the migration layer. Re-exports the abstract
 * Migration base class, MigrationRunner, and related types.
 */

export { Migration } from './migration';
export { MigrationRunner } from './migration.runner';
export type { MigrationRecord } from './migration.runner';

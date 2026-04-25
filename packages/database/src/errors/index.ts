/**
 * @file errors/index.ts
 * @description Barrel export for all custom error classes used
 * throughout the rxdb-eloquent package. Each error class carries
 * structured context (e.g. the invalid connection name, the
 * guarded attribute key) to aid debugging.
 */

export { ConnectionNotConfiguredError } from './connection-not-configured.error';
export { MassAssignmentError } from './mass-assignment.error';
export { ModelNotFoundError } from './model-not-found.error';
export { QueryCompilationError } from './query-compilation.error';
export { MigrationError } from './migration.error';
export { SchemaCompilationError } from './schema-compilation.error';
export { RelationNotLoadedError } from './relation-not-loaded.error';

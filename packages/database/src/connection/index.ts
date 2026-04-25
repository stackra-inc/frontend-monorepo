/**
 * @file connection/index.ts
 * @description Barrel export for the connection layer. Re-exports the
 * Connection class, ConnectionManager, and all connection-related type
 * definitions so consumers can import from a single entry point.
 */

export { Connection } from './connection';
export { ConnectionManager } from './connection.manager';
export type {
  ConnectionConfig,
  ConnectionDefinition,
  CollectionOptions,
  DriverType,
  ReplicationConfig,
  ReplicationProvider,
  SupabasePullConfig,
  SupabasePushConfig,
} from './connection.types';

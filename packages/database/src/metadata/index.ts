/**
 * @file index.ts
 * @description Barrel export for the metadata module.
 *
 * Re-exports the MetadataStorage singleton class and all metadata type interfaces
 * so that decorators and other modules can import them from a single path.
 */
export {
  MetadataStorage,
  type ColumnOptions,
  type ColumnMetadata,
  type RelationMetadata,
  type ScopeMetadata,
  type HookMetadata,
  type AccessorMutatorMetadata,
  type ClassMetadata,
} from './metadata.storage';

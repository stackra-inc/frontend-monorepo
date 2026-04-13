/**
 * @file index.ts
 * @description Public API barrel export for the rxdb-eloquent package.
 *
 * This is the single entry point for all public classes, interfaces, types,
 * decorators, and error classes. Consumers import everything from here:
 *
 * ```ts
 * import {
 *   Model, QueryBuilder, SchemaBuilder, ConnectionManager,
 *   Collection, Column, HasMany, BeforeCreate,
 *   Factory, Seeder, Repository, Service,
 * } from 'rxdb-eloquent';
 * ```
 *
 * The exports are organized by layer:
 * 1. Model layer — Model, ModelStatic, Observer, concerns
 * 2. Query layer — QueryBuilder, grammars, state types
 * 3. Schema layer — Blueprint, SchemaBuilder, SchemaResolver, grammars
 * 4. Connection layer — Connection, ConnectionManager, config types
 * 5. Relations — Relation, HasOne, HasMany, BelongsTo, BelongsToMany
 * 6. Migration — Migration, MigrationRunner
 * 7. Factory & Seeder — Factory, Seeder
 * 8. Repository & Service — Repository, Service
 * 9. Metadata — MetadataStorage, metadata types
 * 10. Decorators — all class, property, relation, and method decorators
 * 11. Scopes — Scope interface
 * 12. Errors — all custom error classes
 */

// ---------------------------------------------------------------------------
// 1. Model Layer
// ---------------------------------------------------------------------------
export { Model } from './model/model';
export type { ModelStatic } from './model/model';
export { Observer } from './model/observer';

// Concerns (for advanced users who want to compose their own mixins)
export { HasAttributes } from './model/concerns/has-attributes.concern';
export type { HasAttributesInterface, CastType } from './model/concerns/has-attributes.concern';
export { GuardsAttributes } from './model/concerns/guards-attributes.concern';
export type { GuardsAttributesInterface } from './model/concerns/guards-attributes.concern';
export { HidesAttributes } from './model/concerns/hides-attributes.concern';
export type { HidesAttributesInterface } from './model/concerns/hides-attributes.concern';
export { HasTimestamps } from './model/concerns/has-timestamps.concern';
export type { HasTimestampsInterface } from './model/concerns/has-timestamps.concern';
export { SoftDeletes } from './model/concerns/soft-deletes.concern';
export type { SoftDeletesInterface } from './model/concerns/soft-deletes.concern';
export { HasGlobalScopes } from './model/concerns/has-global-scopes.concern';
export type {
  HasGlobalScopesInterface,
  GlobalScopeEntry,
} from './model/concerns/has-global-scopes.concern';
export { HasEvents } from './model/concerns/has-events.concern';
export type {
  HasEventsInterface,
  LifecycleEvent,
  HookCallback,
} from './model/concerns/has-events.concern';
export { HasRelationships } from './model/concerns/has-relationships.concern';
export type { HasRelationshipsInterface } from './model/concerns/has-relationships.concern';

// ---------------------------------------------------------------------------
// 2. Query Layer
// ---------------------------------------------------------------------------
export { QueryBuilder } from './query/query.builder';
export type {
  QueryBuilderState,
  WhereClause,
  WhereOperator,
  OrderByClause,
} from './query/query.builder';
export { QueryGrammar } from './query/grammars/query.grammar';
export { MangoQueryGrammar } from './query/grammars/mango-query.grammar';
export type { MangoQuery } from './query/grammars/mango-query.grammar';
export { SqlQueryGrammar } from './query/grammars/sql-query.grammar';

// ---------------------------------------------------------------------------
// 3. Schema Layer
// ---------------------------------------------------------------------------
export { ColumnDefinition } from './schema/column.definition';
export type { ColumnType } from './schema/column.definition';
export { Blueprint } from './schema/blueprint';
export { SchemaBuilder } from './schema/schema.builder';
export { SchemaResolver } from './schema/schema.resolver';
export { SchemaGrammar } from './schema/grammars/schema.grammar';
export { RxDBSchemaGrammar } from './schema/grammars/rxdb-schema.grammar';
export { SupabaseSchemaGrammar } from './schema/grammars/supabase-schema.grammar';

// ---------------------------------------------------------------------------
// 4. Connection Layer
// ---------------------------------------------------------------------------
export { Connection } from './connection/connection';
export { ConnectionManager } from './connection/connection.manager';
export type {
  ConnectionConfig,
  ConnectionDefinition,
  CollectionOptions,
  DriverType,
  ReplicationConfig,
  ReplicationProvider,
  SupabasePullConfig,
  SupabasePushConfig,
} from './connection/connection.types';

// ---------------------------------------------------------------------------
// 5. Relations
// ---------------------------------------------------------------------------
export { Relation } from './relations/relation';
export { HasOneRelation } from './relations/has-one.relation';
export { HasManyRelation } from './relations/has-many.relation';
export { BelongsToRelation } from './relations/belongs-to.relation';
export { BelongsToManyRelation } from './relations/belongs-to-many.relation';

// ---------------------------------------------------------------------------
// 6. Migration Layer
// ---------------------------------------------------------------------------
export { Migration } from './migration/migration';
export { MigrationRunner } from './migration/migration.runner';
export type { MigrationRecord } from './migration/migration.runner';

// ---------------------------------------------------------------------------
// 7. Factory & Seeder
// ---------------------------------------------------------------------------
export { Factory } from './factory/factory';
export { Seeder } from './seeder/seeder';

// ---------------------------------------------------------------------------
// 8. Repository & Service
// ---------------------------------------------------------------------------
export { Repository } from './repository/repository';
export { Service } from './service/service';

// ---------------------------------------------------------------------------
// 9. Metadata
// ---------------------------------------------------------------------------
export { MetadataStorage } from './metadata/metadata.storage';
export type {
  ColumnOptions,
  ColumnMetadata,
  RelationMetadata,
  ScopeMetadata,
  HookMetadata,
  AccessorMutatorMetadata,
  ClassMetadata,
} from './metadata/metadata.storage';

// ---------------------------------------------------------------------------
// 10. Decorators
// ---------------------------------------------------------------------------

// Class decorators
export { Collection } from './decorators/collection.decorator';
export { Connection as ConnectionDecorator } from './decorators/connection.decorator';
export { Timestamps } from './decorators/timestamps.decorator';
export { SoftDeletes as SoftDeletesDecorator } from './decorators/soft-deletes.decorator';
export { ObservedBy } from './decorators/observed-by.decorator';

// Property decorators
export { Column } from './decorators/column.decorator';
export { PrimaryKey } from './decorators/primary-key.decorator';
export { Fillable } from './decorators/fillable.decorator';
export { Guarded } from './decorators/guarded.decorator';
export { Hidden } from './decorators/hidden.decorator';
export { Visible } from './decorators/visible.decorator';
export { Cast } from './decorators/cast.decorator';
export { Index } from './decorators/index.decorator';
export { Final } from './decorators/final.decorator';
export { Default } from './decorators/default.decorator';
export { Ref } from './decorators/ref.decorator';

// Relation decorators
export { HasOne } from './decorators/has-one.decorator';
export { HasMany } from './decorators/has-many.decorator';
export { BelongsTo } from './decorators/belongs-to.decorator';
export { BelongsToMany } from './decorators/belongs-to-many.decorator';

// Method decorators
export { Scope } from './decorators/scope.decorator';
export { GlobalScope } from './decorators/global-scope.decorator';
export { Accessor } from './decorators/accessor.decorator';
export { Mutator } from './decorators/mutator.decorator';
export { BeforeCreate } from './decorators/before-create.decorator';
export { AfterCreate } from './decorators/after-create.decorator';
export { BeforeUpdate } from './decorators/before-update.decorator';
export { AfterUpdate } from './decorators/after-update.decorator';
export { BeforeDelete } from './decorators/before-delete.decorator';
export { AfterDelete } from './decorators/after-delete.decorator';

// ---------------------------------------------------------------------------
// 11. Scopes
// ---------------------------------------------------------------------------
export type { Scope as ScopeInterface } from './scopes/scope';

// ---------------------------------------------------------------------------
// 12. Errors
// ---------------------------------------------------------------------------
export { ConnectionNotConfiguredError } from './errors/connection-not-configured.error';
export { MassAssignmentError } from './errors/mass-assignment.error';
export { ModelNotFoundError } from './errors/model-not-found.error';
export { QueryCompilationError } from './errors/query-compilation.error';
export { MigrationError } from './errors/migration.error';
export { SchemaCompilationError } from './errors/schema-compilation.error';
export { RelationNotLoadedError } from './errors/relation-not-loaded.error';

// ---------------------------------------------------------------------------
// 13. Module System
// ---------------------------------------------------------------------------
export { EloquentModule } from './eloquent.module';
export type { EloquentRootOptions, EloquentFeatureOptions } from './eloquent.module';
export { MIGRATION_REGISTRY, SEEDER_REGISTRY, OBSERVER_REGISTRY } from './eloquent.module';

// ---------------------------------------------------------------------------
// 14. Registries
// ---------------------------------------------------------------------------
export { ModelRegistry } from './registries/model.registry';
export type { ModelClass } from './registries/model.registry';
export { MigrationRegistry } from './registries/migration.registry';
export { SeederRegistry } from './registries/seeder.registry';
export { ObserverRegistry } from './registries/observer.registry';

// ---------------------------------------------------------------------------
// 15. Replication Helpers
// ---------------------------------------------------------------------------
export { generateTableSQL, generateSupabaseMigrationSQL } from './replication/supabase-migration.helper';

// ---------------------------------------------------------------------------
// 16. DI Tokens
// ---------------------------------------------------------------------------
export {
  ELOQUENT_CONFIG,
  CONNECTION_MANAGER,
  MODEL_REGISTRY,
  SCHEMA_RESOLVER,
  MIGRATION_RUNNER,
  SEEDER_RUNNER,
} from './constants/tokens.constant';

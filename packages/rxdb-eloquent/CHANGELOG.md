# @stackra/ts-eloquent

## 1.0.0

### Major Features

- 🎉 Initial release of @stackra/ts-eloquent
- 🏗️ `EloquentModule.forRoot()` / `forFeature()` with DI integration
- 📦 `Model` base class with Eloquent-style API (find, create, update, delete)
- 🔍 `QueryBuilder` with where, orderBy, limit, fluent chaining
- 🗂️ Schema layer: `Blueprint`, `SchemaBuilder`, `SchemaResolver`,
  `ColumnDefinition`
- 🎨 Query grammars: `MangoQueryGrammar`, `SqlQueryGrammar`
- 📐 Schema grammars: `RxDBSchemaGrammar`, `SupabaseSchemaGrammar`
- 🔗 Relations: `HasOneRelation`, `HasManyRelation`, `BelongsToRelation`,
  `BelongsToManyRelation`
- 🎭 30+ decorators: `@Collection`, `@Column`, `@PrimaryKey`, `@Fillable`,
  `@Guarded`, `@Hidden`, `@Visible`, `@Cast`, `@Index`, `@Final`, `@Default`,
  `@Ref`, `@Timestamps`, `@SoftDeletes`, `@ObservedBy`, `@HasOne`, `@HasMany`,
  `@BelongsTo`, `@BelongsToMany`, `@Scope`, `@GlobalScope`, `@Accessor`,
  `@Mutator`, `@BeforeCreate`, `@AfterCreate`, `@BeforeUpdate`, `@AfterUpdate`,
  `@BeforeDelete`, `@AfterDelete`
- 🔌 `ConnectionManager` for multiple named database connections
- 👁️ `Observer` pattern with `ObserverRegistry`
- 🌱 `Factory` for test data generation
- 🌾 `Seeder` and `SeederRegistry` for database seeding
- 📋 `Repository` and `Service` base classes
- 🔀 `Migration` and `MigrationRunner` with auto-migrate support
- 📡 Supabase replication helpers (`generateTableSQL`,
  `generateSupabaseMigrationSQL`)
- ⚛️ React hook: `useFind(Model, id, { live })` with reactive RxDB subscriptions
- 🏷️ DI tokens: `ELOQUENT_CONFIG`, `CONNECTION_MANAGER`, `MODEL_REGISTRY`,
  `SCHEMA_RESOLVER`, `MIGRATION_RUNNER`, `SEEDER_RUNNER`, `MIGRATION_REGISTRY`,
  `SEEDER_REGISTRY`, `OBSERVER_REGISTRY`
- 📦 Model concerns: `HasAttributes`, `GuardsAttributes`, `HidesAttributes`,
  `HasTimestamps`, `SoftDeletes`, `HasGlobalScopes`, `HasEvents`,
  `HasRelationships`
- 🔧 `MetadataStorage` for decorator metadata management
- ❌ Custom errors: `ModelNotFoundError`, `MassAssignmentError`,
  `ConnectionNotConfiguredError`, `QueryCompilationError`,
  `SchemaCompilationError`, `MigrationError`, `RelationNotLoadedError`

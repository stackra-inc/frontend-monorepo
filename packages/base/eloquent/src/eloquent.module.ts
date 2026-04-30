/**
 * @file eloquent.module.ts
 * @description The root DI module for rxdb-eloquent. Pure wiring, zero state.
 *
 * All state lives in the registries. The module just creates them in
 * `forRoot()` and delegates to them in `forFeature()`.
 *
 * Lifecycle:
 * 1. `forRoot(config)` — creates global singletons
 * 2. `forFeature(options)` — registers models/migrations/seeders/observers
 * 3. DI container calls `onModuleInit()` on each registry:
 *    - `ModelRegistry.onModuleInit()` → wires ConnectionManager into Model, boots collections
 *    - `MigrationRegistry.onModuleInit()` → runs pending migrations (if autoMigrate)
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [
 *     EloquentModule.forRoot({
 *       default: 'local',
 *       connections: { local: { driver: 'memory', name: 'app' } },
 *     }),
 *   ],
 * })
 * class AppModule {}
 *
 * @Module({
 *   imports: [
 *     EloquentModule.forFeature({
 *       models: [User, Post],
 *       migrations: [CreateUsersTable],
 *       seeders: [UserSeeder],
 *       observers: [{ model: User, observer: UserObserver }],
 *     }),
 *   ],
 * })
 * class UserModule {}
 * ```
 */

import { Module, Global, type DynamicModule } from '@stackra/ts-container';

import { ConnectionManager } from './connection/connection.manager';
import { SchemaResolver } from './schema/schema.resolver';
import { ModelRegistry } from './registries/model.registry';
import type { ModelClass } from './registries/model.registry';
import { MigrationRegistry } from './registries/migration.registry';
import { SeederRegistry } from './registries/seeder.registry';
import { ObserverRegistry } from './registries/observer.registry';
import type { ConnectionConfig } from './connection/connection.types';
import type { Migration } from './migration/migration';
import type { Seeder } from './seeder/seeder';
import type { Observer } from './model/observer';
import {
  ELOQUENT_CONFIG,
  CONNECTION_MANAGER,
  MODEL_REGISTRY,
  SCHEMA_RESOLVER,
} from './constants/tokens.constant';

// ---------------------------------------------------------------------------
// Additional tokens for the registries
// ---------------------------------------------------------------------------

/** MigrationRegistry token. */
export const MIGRATION_REGISTRY = Symbol.for('MIGRATION_REGISTRY');

/** SeederRegistry token. */
export const SEEDER_REGISTRY = Symbol.for('SEEDER_REGISTRY');

/** ObserverRegistry token. */
export const OBSERVER_REGISTRY = Symbol.for('OBSERVER_REGISTRY');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Options for `EloquentModule.forRoot()`. */
export type EloquentRootOptions = ConnectionConfig & {
  /**
   * Whether to automatically run pending migrations on boot.
   * @default false
   */
  autoMigrate?: boolean;

  /**
   * Whether to automatically run registered seeders after boot.
   * Seeders run after models are booted and migrations complete.
   * @default false
   */
  autoSeed?: boolean;
};

/** Options for `EloquentModule.forFeature()`. */
export type EloquentFeatureOptions = {
  /** Model classes to register. */
  models?: ModelClass[];
  /** Migration classes to register. */
  migrations?: Array<new () => Migration>;
  /** Seeder classes to register. */
  seeders?: Array<new () => Seeder>;
  /** Observer bindings (model → observer). */
  observers?: Array<{
    model: ModelClass;
    observer: new (...args: any[]) => Observer;
  }>;
};

// ---------------------------------------------------------------------------
// EloquentModule
// ---------------------------------------------------------------------------

@Global()
@Module({})
export class EloquentModule {
  // -----------------------------------------------------------------------
  // Static pending queues — populated by forFeature() at import time,
  // drained by ModelRegistry.onModuleInit() after DI resolution.
  // -----------------------------------------------------------------------

  /** Models waiting to be registered when ModelRegistry boots. */
  static readonly pendingModels: ModelClass[] = [];

  /** Migrations waiting to be registered. */
  static readonly pendingMigrations: Array<new () => Migration> = [];

  /** Seeders waiting to be registered. */
  static readonly pendingSeeders: Array<new () => Seeder> = [];

  /** Observers waiting to be registered. */
  static readonly pendingObservers: Array<{
    model: ModelClass;
    observer: new (...args: any[]) => Observer;
  }> = [];

  /** Whether autoSeed was enabled in forRoot(). */
  static autoSeed: boolean = false;
  /**
   * Configure the root module. Creates all global singletons.
   * Import once in your root AppModule.
   *
   * The registries implement `OnModuleInit`:
   * - `ModelRegistry.onModuleInit()` → wires ConnectionManager into Model,
   *   resolves schemas, creates RxDB collections
   * - `MigrationRegistry.onModuleInit()` → runs pending migrations (if autoMigrate)
   *
   * @param config - Database connection configuration + options.
   */
  static forRoot(config: EloquentRootOptions): DynamicModule {
    // Store autoSeed flag for ModelRegistry to use after boot
    EloquentModule.autoSeed = config.autoSeed ?? false;
    return {
      module: EloquentModule,
      global: true,
      providers: [
        // Raw config
        { provide: ELOQUENT_CONFIG, useValue: config },

        // ConnectionManager — created eagerly so registries can inject it
        {
          provide: ConnectionManager,
          useFactory: () => new ConnectionManager(config),
        },
        { provide: CONNECTION_MANAGER, useExisting: ConnectionManager },

        // SchemaResolver
        { provide: SchemaResolver, useClass: SchemaResolver },
        { provide: SCHEMA_RESOLVER, useExisting: SchemaResolver },

        // ModelRegistry — @Injectable with OnModuleInit
        // DI creates it, injects ConnectionManager + SchemaResolver,
        // then calls onModuleInit() which boots all models
        { provide: ModelRegistry, useClass: ModelRegistry },
        { provide: MODEL_REGISTRY, useExisting: ModelRegistry },

        // MigrationRegistry — @Injectable with OnModuleInit
        {
          provide: MigrationRegistry,
          useFactory: (cm: ConnectionManager) => {
            const registry = new MigrationRegistry(cm);
            if (config.autoMigrate) {
              registry.setAutoMigrate(true);
            }
            return registry;
          },
          inject: [ConnectionManager],
        },
        { provide: MIGRATION_REGISTRY, useExisting: MigrationRegistry },

        // SeederRegistry — no lifecycle, on-demand only
        { provide: SeederRegistry, useClass: SeederRegistry },
        { provide: SEEDER_REGISTRY, useExisting: SeederRegistry },

        // ObserverRegistry — no lifecycle
        { provide: ObserverRegistry, useClass: ObserverRegistry },
        { provide: OBSERVER_REGISTRY, useExisting: ObserverRegistry },
      ],
      exports: [
        ConnectionManager,
        CONNECTION_MANAGER,
        SchemaResolver,
        SCHEMA_RESOLVER,
        ModelRegistry,
        MODEL_REGISTRY,
        MigrationRegistry,
        MIGRATION_REGISTRY,
        SeederRegistry,
        SEEDER_REGISTRY,
        ObserverRegistry,
        OBSERVER_REGISTRY,
        ELOQUENT_CONFIG,
      ],
    };
  }

  /**
   * Register feature-specific models, migrations, seeders, and observers.
   * Import in each feature module.
   *
   * Pushes classes into static pending queues that are drained by
   * `ModelRegistry.onModuleInit()` after the DI container finishes
   * resolving all providers. This avoids the problem of factory
   * providers with random tokens never being resolved.
   *
   * @param options - Feature options.
   */
  static forFeature(options: EloquentFeatureOptions): DynamicModule {
    // Push into static pending queues — drained by registries in onModuleInit()
    if (options.models) {
      EloquentModule.pendingModels.push(...options.models);
    }
    if (options.migrations) {
      EloquentModule.pendingMigrations.push(...options.migrations);
    }
    if (options.seeders) {
      EloquentModule.pendingSeeders.push(...options.seeders);
    }
    if (options.observers) {
      EloquentModule.pendingObservers.push(...options.observers);
    }

    return {
      module: EloquentModule,
      providers: [],
      exports: [],
    };
  }
}

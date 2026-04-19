/**
 * @file tokens.constant.ts
 * @description DI injection tokens for the rxdb-eloquent package.
 *
 * These symbols are used with `@stackra-inc/ts-container` to identify
 * providers in the dependency injection container. Consumers inject
 * these tokens to access global services like ConnectionManager,
 * ModelRegistry, MigrationRunner, and SeederRunner.
 *
 * @example
 * ```ts
 * import { Inject } from '@stackra-inc/ts-container';
 * import { MODEL_REGISTRY } from 'rxdb-eloquent';
 *
 * constructor(@Inject(MODEL_REGISTRY) private registry: ModelRegistry) {}
 * ```
 */

/** Raw database connection configuration object. */
export const ELOQUENT_CONFIG = Symbol.for('ELOQUENT_CONFIG');

/** ConnectionManager — creates and caches RxDatabase instances. */
export const CONNECTION_MANAGER = Symbol.for('CONNECTION_MANAGER');

/** ModelRegistry — stores registered Model classes, resolves schemas, boots collections. */
export const MODEL_REGISTRY = Symbol.for('MODEL_REGISTRY');

/** SchemaResolver — reads decorator metadata and produces RxJsonSchema. */
export const SCHEMA_RESOLVER = Symbol.for('SCHEMA_RESOLVER');

/** MigrationRunner — executes and tracks database migrations. */
export const MIGRATION_RUNNER = Symbol.for('MIGRATION_RUNNER');

/** SeederRunner — collects and executes database seeders. */
export const SEEDER_RUNNER = Symbol.for('SEEDER_RUNNER');

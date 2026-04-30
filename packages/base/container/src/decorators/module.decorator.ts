/**
 * @Module() Decorator
 *
 * Defines a module — the organizational unit of the DI system.
 * Modules group related providers and define the dependency graph
 * between different parts of the application.
 *
 * ## How it works:
 *
 * The decorator iterates over the metadata object and stores each
 * property as a separate metadata entry on the class:
 *
 * ```
 * @Module({ imports: [...], providers: [...], exports: [...] })
 * class MyModule {}
 *
 * // Becomes:
 * defineMetadata('imports', [...], MyModule)
 * defineMetadata('providers', [...], MyModule)
 * defineMetadata('exports', [...], MyModule)
 * ```
 *
 * The scanner later reads these metadata entries to build the module graph.
 *
 * All metadata writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @module decorators/module
 */

import { defineMetadata } from '@vivtel/metadata';

import type { ModuleMetadata } from '@/interfaces';

/**
 * Valid keys for @Module() metadata.
 *
 * Used to validate that consumers don't pass unknown properties
 * into the decorator, which would silently be ignored.
 */
const VALID_MODULE_KEYS = new Set(['imports', 'providers', 'exports', 'entryProviders']);

/**
 * Defines a module with its imports, providers, and exports.
 *
 * Validates that only known metadata keys are used, then stores each
 * property as a separate `Reflect.defineMetadata` entry on the target class.
 * The scanner reads these entries during the module graph traversal.
 *
 * @param metadata - Module configuration specifying imports, providers, and exports.
 *   Only the keys `imports`, `providers`, and `exports` are allowed.
 * @returns A `ClassDecorator` that stores the module metadata on the target class
 *
 * @throws Error if any unknown property keys are passed in the metadata object
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [ConfigModule.forRoot(config)],
 *   providers: [UserService, UserRepository],
 *   exports: [UserService],
 * })
 * class UserModule {}
 * ```
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
  // Validate that only known keys are used
  const invalidKeys = Object.keys(metadata).filter((key) => !VALID_MODULE_KEYS.has(key));
  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid property '${invalidKeys.join("', '")}' passed into the @Module() decorator. ` +
        `Valid properties are: ${[...VALID_MODULE_KEYS].join(', ')}.`
    );
  }

  return (target: object) => {
    for (const property in metadata) {
      if (Object.prototype.hasOwnProperty.call(metadata, property)) {
        defineMetadata(property, (metadata as Record<string, unknown>)[property], target);
      }
    }
  };
}

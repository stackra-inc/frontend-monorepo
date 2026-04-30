/**
 * Middleware Registry
 *
 * Extends {@link BaseRegistry} from `@stackra/ts-support` to store
 * HTTP middleware instances sorted by priority. Lower priority values
 * execute first in the pipeline.
 *
 * The {@link HttpModule} populates this registry during initialization
 * by reading `@HttpMiddleware()` metadata from provider classes.
 *
 * @module @stackra/ts-http
 * @category Registries
 *
 * @example
 * ```typescript
 * import { MiddlewareRegistry } from '@stackra/ts-http';
 *
 * const registry = new MiddlewareRegistry();
 *
 * registry.registerWithPriority('auth', authMiddleware, 10);
 * registry.registerWithPriority('retry', retryMiddleware, 20);
 * registry.registerWithPriority('logging', loggingMiddleware, 90);
 *
 * // Returns [authMiddleware, retryMiddleware, loggingMiddleware]
 * const sorted = registry.getSorted();
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { BaseRegistry } from '@stackra/ts-support';
import type { HttpMiddlewareInterface } from '@/interfaces/http-middleware.interface';

/**
 * Internal entry pairing a middleware instance with its priority.
 */
interface MiddlewareEntry {
  /** Execution priority — lower runs first. */
  priority: number;

  /** The middleware instance. */
  middleware: HttpMiddlewareInterface;
}

/**
 * Registry for HTTP middleware instances.
 *
 * Stores middleware by name and maintains a priority-sorted list
 * for the {@link MiddlewarePipeline} to consume.
 */
@Injectable()
export class MiddlewareRegistry extends BaseRegistry<HttpMiddlewareInterface> {
  /*
  |--------------------------------------------------------------------------
  | Internal State
  |--------------------------------------------------------------------------
  */

  /** Priority-sorted middleware entries. Rebuilt on each registration. */
  private sorted: MiddlewareEntry[] = [];

  /*
  |--------------------------------------------------------------------------
  | registerWithPriority
  |--------------------------------------------------------------------------
  |
  | Register a middleware with an explicit priority value.
  | The sorted list is rebuilt after each registration.
  |
  */

  /**
   * Register a middleware instance with a specific priority.
   *
   * @param name       - Unique name for the middleware (used as registry key).
   * @param middleware  - The middleware instance to register.
   * @param priority   - Execution priority (lower = runs first).
   */
  registerWithPriority(name: string, middleware: HttpMiddlewareInterface, priority: number): void {
    // Register in the base registry for key-based lookups.
    this.register(name, middleware);

    // Remove any existing entry with the same name before re-adding.
    this.sorted = this.sorted.filter((entry) => entry.middleware !== middleware);

    // Add the new entry and re-sort by priority ascending.
    this.sorted.push({ priority, middleware });
    this.sorted.sort((a, b) => a.priority - b.priority);
  }

  /*
  |--------------------------------------------------------------------------
  | getSorted
  |--------------------------------------------------------------------------
  |
  | Returns middleware instances in priority order (ascending).
  | The MiddlewarePipeline uses this to build the execution chain.
  |
  */

  /**
   * Get all registered middleware sorted by priority (ascending).
   *
   * @returns Array of middleware instances, lowest priority first.
   */
  getSorted(): HttpMiddlewareInterface[] {
    return this.sorted.map((entry) => entry.middleware);
  }

  /*
  |--------------------------------------------------------------------------
  | Override clear
  |--------------------------------------------------------------------------
  */

  /**
   * Remove all middleware from the registry.
   */
  override clear(): void {
    super.clear();
    this.sorted = [];
  }
}

/** Global singleton MiddlewareRegistry. */
export const middlewareRegistry = new MiddlewareRegistry();

/**
 * @fileoverview ServiceRegistry — maps resource names to Service instances.
 *
 * Hooks resolve the correct service by calling `resolve(resourceName)`.
 * Services are registered by `forFeature()` during module initialization.
 *
 * @module @stackra/react-refine
 * @category Registries
 *
 * @example
 * ```typescript
 * const ServiceRegistry();
 * registry.register('posts', postService);
 * const service = registry.resolve('posts'); // → postService
 * ```
 */

import { Injectable } from '@stackra/ts-container';
import { BaseRegistry } from '@stackra/ts-support';
import type { BaseService } from '@/services/base.service';

/**
 * Singleton registry mapping resource name strings to Service instances.
 *
 * Resource names come from `@Resource` metadata, read by `forFeature()`.
 */
@Injectable()
export class ServiceRegistry extends BaseRegistry<BaseService<any, any>> {
  /**
   * Resolve a service by resource name.
   *
   * @param resourceName - The resource name to look up.
   * @returns The registered service instance.
   * @throws {Error} If no service is registered for the given name.
   */
  resolve(resourceName: string): BaseService<any, any> {
    const service = this.get(resourceName);
    if (!service) {
      const available = this.getRegisteredNames().join(', ');
      throw new Error(
        `No service registered for resource "${resourceName}". ` +
          `Available resources: [${available}]. ` +
          `Did you forget to add the Model class to RefineModule.forFeature()?`
      );
    }
    return service;
  }

  /**
   * Get all registered resource names.
   *
   * @returns Array of registered resource name strings.
   */
  getRegisteredNames(): string[] {
    return this.getKeys();
  }
}

/** Global singleton ServiceRegistry. */
export const serviceRegistry = new ServiceRegistry();

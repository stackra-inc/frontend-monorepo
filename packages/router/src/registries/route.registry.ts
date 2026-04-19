/**
 * @fileoverview RouteRegistry — stores route definitions for auto-registration.
 *
 * @module @stackra-inc/react-router
 * @category Registries
 */

import { Injectable } from '@stackra-inc/ts-container';
import { BaseRegistry } from '@stackra-inc/ts-support';
import type { ComponentType } from 'react';
import type { RouteMetadata } from '@/interfaces/route-metadata.interface';
import type { RouteDefinition } from '@/interfaces/route-definition.interface';

/**
 * Singleton registry that stores route metadata collected from `@Route` decorators.
 *
 * Extends BaseRegistry from @stackra-inc/ts-support for consistent
 * registry API (get, has, getAll, getKeys, register, clear).
 */
@Injectable()
export class RouteRegistry extends BaseRegistry<RouteDefinition> {
  /**
   * Register a route.
   *
   * Supports two signatures for backward compatibility:
   * - `register(metadata, component)` — legacy signature from `@Route` decorator
   * - `register(key, definition)` — BaseRegistry signature
   *
   * @param metadataOrKey - Route metadata or a string key.
   * @param componentOrDefinition - React component or RouteDefinition.
   */
  override register(
    metadataOrKey: RouteMetadata | string,
    componentOrDefinition: ComponentType<any> | RouteDefinition
  ): void {
    if (typeof metadataOrKey === 'string') {
      // BaseRegistry signature: register(key, definition)
      super.register(metadataOrKey, componentOrDefinition as RouteDefinition);
    } else {
      // Legacy signature: register(metadata, component)
      const metadata = metadataOrKey;
      const component = componentOrDefinition as ComponentType<any>;
      const definition: RouteDefinition = { ...metadata, component };
      super.register(metadata.path, definition);
    }
  }

  /**
   * Get all registered routes.
   * @returns Array of route definitions.
   */
  getRoutes(): RouteDefinition[] {
    return this.getAll();
  }

  /**
   * Check if a route path is already registered.
   * @param path - Route path to check.
   * @returns `true` if registered.
   */
  override has(path: string): boolean {
    return super.has(path);
  }
}

/** Global singleton RouteRegistry. */
export const routeRegistry = new RouteRegistry();

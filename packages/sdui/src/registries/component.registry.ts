/**
 * @fileoverview ComponentRegistry — maps component type strings to React components.
 *
 * @module @stackra/react-sdui
 * @category Registries
 */

import { Injectable } from '@stackra/ts-container';
import { BaseRegistry } from '@stackra/ts-support';
import type { ComponentType } from 'react';

/**
 * Registry mapping Filament component type strings to React component implementations.
 *
 * Extends BaseRegistry from @stackra/ts-support for consistent
 * registry API (get, has, getAll, getKeys, register, clear).
 *
 * Uses a fallback renderer for unknown component types — returns `() => null`
 * when a type is not registered.
 */
@Injectable()
export class ComponentRegistry extends BaseRegistry<ComponentType<any>> {
  constructor() {
    super({
      defaultItem: (() => null) as unknown as ComponentType<any>,
    });
  }

  /**
   * Resolve a component by type string.
   * Returns a fallback "unknown component" renderer for unregistered types.
   * @param type - Component type identifier.
   * @returns The registered React component, or a fallback.
   */
  resolve(type: string): ComponentType<any> {
    return this.get(type) ?? (() => null);
  }

  /**
   * Get all registered component type names.
   * @returns Array of registered type strings.
   */
  getComponentTypes(): string[] {
    return this.getKeys();
  }

  /**
   * Get all registered components.
   * @returns Array of registered React components.
   */
  getComponents(): ComponentType<any>[] {
    return this.getAll();
  }
}

/** Global singleton ComponentRegistry. */
export const componentRegistry = new ComponentRegistry();

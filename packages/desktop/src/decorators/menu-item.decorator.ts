/**
 * @MenuItem Decorator
 *
 * Marks a method as a menu item within a @Menu() class.
 *
 * All metadata reads and writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @example
 * ```typescript
 * @Menu('file')
 * @Injectable()
 * class FileMenu {
 *   @MenuItem({ label: 'Save', accelerator: 'CmdOrCtrl+S' })
 *   save() { ... }
 *
 *   @MenuItem({ type: 'separator' })
 *   sep() {}
 *
 *   @MenuItem({ role: 'quit' })
 *   quit() {}
 * }
 * ```
 */

import { getMetadata, updateMetadata } from '@vivtel/metadata';
import { MENU_ITEM_METADATA } from '@/constants';
import type { MenuItemOptions, MenuItemMetadata } from '@/interfaces';

export function MenuItem(options: MenuItemOptions = {}): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    updateMetadata(
      MENU_ITEM_METADATA,
      [] as MenuItemMetadata[],
      (existing) => [...existing, { method: String(propertyKey), options }],
      target.constructor as object
    );
  };
}

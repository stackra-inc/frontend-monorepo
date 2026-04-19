/**
 * @Menu Decorator
 *
 * Marks a class as a menu section (File, Edit, View, etc.).
 * Methods decorated with @MenuItem() become menu items.
 * Auto-discovered by DesktopModule from the providers array.
 *
 * All metadata writes go through `@vivtel/metadata` for a consistent,
 * typed API instead of raw `Reflect.*` calls.
 *
 * @example
 * ```typescript
 * @Menu('file', { label: 'File', order: 0 })
 * @Injectable()
 * class FileMenu {
 *   @MenuItem({ label: 'New Order', accelerator: 'CmdOrCtrl+N' })
 *   newOrder() { ... }
 * }
 * ```
 */

import { defineMetadata } from '@vivtel/metadata';
import { Str } from '@stackra/ts-support';
import { MENU_METADATA } from '@/constants';
import type { MenuMetadata } from '@/interfaces';

export function Menu(id: string, options?: { label?: string; order?: number }): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    const metadata: MenuMetadata = {
      id,
      label: options?.label ?? Str.ucfirst(id),
      order: options?.order,
    };
    defineMetadata(MENU_METADATA, metadata, target as object);
  };
}

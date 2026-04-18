/**
 * Menu Registry
 *
 * |--------------------------------------------------------------------------
 * | Collects @Menu / @MenuItem decorated classes and builds the menu template.
 * |--------------------------------------------------------------------------
 * |
 * | Also auto-registers keyboard shortcuts with @stackra/kbd's
 * | ShortcutRegistry when menu items have accelerators.
 * |
 * | Flow:
 * |   1. Modules define @Menu classes with @MenuItem methods
 * |   2. MenuRegistry.register(instance) collects the metadata
 * |   3. Menu items with accelerators are registered as kbd shortcuts
 * |   4. MenuRegistry.buildTemplate() produces the full menu structure
 * |   5. DesktopManager sends it to main process via bridge.send('menu:set')
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable } from '@stackra/ts-container';

import { getMetadata } from '@vivtel/metadata';
import { MENU_METADATA, MENU_ITEM_METADATA } from '@/constants';
import type { MenuMetadata, MenuItemMetadata } from '@/interfaces';

/** A serialisable menu item for IPC transport to the main process. */
export interface SerializedMenuItem {
  label?: string;
  accelerator?: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  role?: string;
  enabled?: boolean;
  visible?: boolean;
  /** IPC channel to send when clicked. */
  ipcChannel?: string;
}

/** A serialisable menu section for IPC transport. */
export interface SerializedMenu {
  id: string;
  label: string;
  order: number;
  items: SerializedMenuItem[];
}

/**
 * Converts an Electron accelerator string to kbd key array.
 * e.g. 'CmdOrCtrl+N' → ['command', 'N'] on Mac, ['ctrl', 'N'] on Windows
 */
function acceleratorToKeys(accelerator: string): string[] {
  return accelerator.split('+').map((key) => {
    const k = key.trim().toLowerCase();
    if (k === 'cmdorctrl' || k === 'commandorcontrol') return 'command';
    if (k === 'cmd' || k === 'command') return 'command';
    if (k === 'ctrl' || k === 'control') return 'ctrl';
    if (k === 'alt' || k === 'option') return 'alt';
    if (k === 'shift') return 'shift';
    return key.trim().toUpperCase();
  });
}

@Injectable()
export class MenuRegistry {
  /** Collected menu sections, keyed by menu id. */
  private readonly menus = new Map<string, SerializedMenu>();

  /** Registered handler callbacks, keyed by IPC channel. */
  private readonly handlers = new Map<string, () => void>();

  /** Collected shortcut registrations for kbd integration. */
  private readonly shortcuts: Array<{
    id: string;
    name: string;
    keys: string[];
    category: string;
    callback: () => void;
  }> = [];

  /**
   * Register a @Menu decorated class instance.
   */
  register(instance: object): void {
    const constructor = instance.constructor;

    const menuMeta: MenuMetadata | undefined = getMetadata<MenuMetadata>(
      MENU_METADATA,
      constructor as object
    );
    if (!menuMeta) {
      console.log(`[MenuRegistry] No @Menu metadata on ${(constructor as any).name} — skipping`);
      return;
    }

    console.log(
      `[MenuRegistry] Registering @Menu('${menuMeta.id}') from ${(constructor as any).name}`
    );

    const itemsMeta: MenuItemMetadata[] =
      getMetadata<MenuItemMetadata[]>(MENU_ITEM_METADATA, constructor as object) ?? [];

    console.log(`[MenuRegistry]   Found ${itemsMeta.length} @MenuItem methods`);

    let menu = this.menus.get(menuMeta.id);
    if (!menu) {
      menu = {
        id: menuMeta.id,
        label: menuMeta.label,
        order: menuMeta.order ?? 50,
        items: [],
      };
      this.menus.set(menuMeta.id, menu);
    }

    for (const itemMeta of itemsMeta) {
      const ipcChannel = `menu:${menuMeta.id}:${itemMeta.method}`;

      const serialized: SerializedMenuItem = {
        label: itemMeta.options.label,
        accelerator: itemMeta.options.accelerator,
        type: itemMeta.options.type ?? 'normal',
        role: itemMeta.options.role,
        enabled: itemMeta.options.enabled ?? true,
        visible: itemMeta.options.visible ?? true,
        ipcChannel: itemMeta.options.type === 'separator' ? undefined : ipcChannel,
      };

      menu.items.push(serialized);

      // Register the handler callback.
      if (serialized.ipcChannel) {
        const handler = (instance as unknown as Record<string, Function>)[itemMeta.method];
        if (typeof handler === 'function') {
          const boundHandler = handler.bind(instance);
          this.handlers.set(ipcChannel, boundHandler);

          /*
          |--------------------------------------------------------------------------
          | Auto-register as kbd shortcut if the item has an accelerator.
          |--------------------------------------------------------------------------
          |
          | This bridges the desktop menu system with the kbd package.
          | In Electron: the native menu handles the shortcut.
          | In browser: kbd's useKeyboardShortcut handles it.
          |
          */
          if (serialized.accelerator && serialized.label) {
            this.shortcuts.push({
              id: `menu:${menuMeta.id}:${itemMeta.method}`,
              name: serialized.label,
              keys: acceleratorToKeys(serialized.accelerator),
              category: menuMeta.id,
              callback: boundHandler,
            });
          }
        }
      }
    }
  }

  /** Build the full menu template sorted by order. */
  buildTemplate(): SerializedMenu[] {
    return Array.from(this.menus.values()).sort((a, b) => a.order - b.order);
  }

  /** Get a handler callback by IPC channel. */
  getHandler(channel: string): (() => void) | undefined {
    return this.handlers.get(channel);
  }

  /** Get all registered IPC channels. */
  getChannels(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get all collected shortcuts for kbd registration.
   *
   * Returns shortcut data that can be passed to kbd's ShortcutRegistry.
   * The DesktopManager calls this and registers them with kbd.
   */
  getShortcuts(): Array<{
    id: string;
    name: string;
    keys: string[];
    category: string;
    callback: () => void;
  }> {
    return [...this.shortcuts];
  }

  /** Number of registered menu sections. */
  get size(): number {
    return this.menus.size;
  }
}

/**
 * Menu Item Interfaces
 *
 * @module @stackra-inc/ts-desktop
 */

/** Options for the @MenuItem() decorator. */
export interface MenuItemOptions {
  /** Display label. */
  label?: string;
  /** Keyboard shortcut (e.g. 'CmdOrCtrl+N'). */
  accelerator?: string;
  /** Menu item type. */
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  /** Electron role (undo, redo, cut, copy, paste, quit, etc.). */
  role?: string;
  /** Whether the item is enabled. @default true */
  enabled?: boolean;
  /** Whether the item is visible. @default true */
  visible?: boolean;
  /** Sort order within the menu section. Lower = higher. */
  order?: number;
}

/** Metadata stored by @Menu() on a class. */
export interface MenuMetadata {
  /** Menu section id (e.g. 'file', 'edit', 'view'). */
  id: string;
  /** Display label for the menu. */
  label: string;
  /** Sort order among top-level menus. */
  order?: number;
}

/** Metadata stored by @MenuItem() on a method. */
export interface MenuItemMetadata {
  method: string;
  options: MenuItemOptions;
}

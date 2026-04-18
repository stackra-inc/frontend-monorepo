/**
 * Window & Shell Interfaces
 *
 * |--------------------------------------------------------------------------
 * | Types for window management, tray, and dock services.
 * |--------------------------------------------------------------------------
 * |
 * @module @stackra/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| Window
|--------------------------------------------------------------------------
*/

/** Options for creating a child window. */
export interface ChildWindowOptions {
  /** URL to load in the window. */
  url: string;
  /** Window width in pixels. */
  width?: number;
  /** Window height in pixels. */
  height?: number;
  /** Window title. */
  title?: string;
  /** Whether to show the window frame. @default true */
  frame?: boolean;
  /** Whether the window should stay on top. @default false */
  alwaysOnTop?: boolean;
}

/** Information about an open window. */
export interface WindowInfo {
  /** Window identifier. */
  id: string;
  /** Window title. */
  title: string;
  /** Whether the window is focused. */
  focused: boolean;
  /** Whether the window is fullscreen. */
  fullscreen: boolean;
}

/*
|--------------------------------------------------------------------------
| Tray
|--------------------------------------------------------------------------
*/

/** Options for creating a system tray icon. */
export interface TrayOptions {
  /** Path to the tray icon image. */
  icon: string;
  /** Tooltip text shown on hover. */
  tooltip?: string;
}

/** Template for a tray context menu. */
export type TrayMenuTemplate = TrayMenuItemOptions[];

/** A single item in a tray context menu. */
export interface TrayMenuItemOptions {
  /** Display label. */
  label: string;
  /** IPC channel to send when clicked. */
  click?: string;
  /** Item type. @default 'normal' */
  type?: 'normal' | 'separator';
}

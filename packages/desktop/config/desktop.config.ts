/**
 * Desktop Configuration
 *
 * |--------------------------------------------------------------------------
 * | Default configuration for the @stackra-inc/ts-desktop package.
 * |--------------------------------------------------------------------------
 * |
 * | Copy this file to your app's config folder and customize:
 * |   cp packages/desktop/config/desktop.config.ts apps/vite/src/config/
 * |
 * | All Electron BrowserWindow options, title bar style, and app metadata
 * | are configured here. The main process reads this via IPC from the renderer.
 * |
 * @module @stackra-inc/ts-desktop
 */

import type { DesktopModuleOptions } from '@stackra-inc/ts-desktop';

/**
 * Window configuration — maps to Electron BrowserWindow options.
 * Sent to the main process via 'window:config' IPC.
 */
export interface WindowConfig {
  /*
  |--------------------------------------------------------------------------
  | Dimensions
  |--------------------------------------------------------------------------
  */

  /** Default window width in pixels. @default 1280 */
  width: number;

  /** Default window height in pixels. @default 800 */
  height: number;

  /** Minimum window width. @default 800 */
  minWidth: number;

  /** Minimum window height. @default 600 */
  minHeight: number;

  /*
  |--------------------------------------------------------------------------
  | Appearance
  |--------------------------------------------------------------------------
  */

  /** Window title shown in the title bar and taskbar. */
  title: string;

  /**
   * Background color shown before the web content loads.
   * Use your app's dark/light background to prevent white flash.
   * @default '#18181b' (zinc-900)
   */
  backgroundColor: string;

  /**
   * Title bar style.
   * - 'default': native OS title bar
   * - 'hidden': hides title bar, content extends to top
   * - 'hiddenInset': macOS only — traffic lights inset into content
   * @default 'hiddenInset'
   */
  titleBarStyle: 'default' | 'hidden' | 'hiddenInset';

  /**
   * Position of the macOS traffic lights (close/min/max).
   * Only applies when titleBarStyle is 'hiddenInset'.
   * @default { x: 15, y: 15 }
   */
  trafficLightPosition: { x: number; y: number };

  /*
  |--------------------------------------------------------------------------
  | Security
  |--------------------------------------------------------------------------
  */

  /** Enable context isolation (recommended). @default true */
  contextIsolation: boolean;

  /** Enable Node.js integration in renderer (NOT recommended). @default false */
  nodeIntegration: boolean;

  /*
  |--------------------------------------------------------------------------
  | Dev
  |--------------------------------------------------------------------------
  */

  /** Open DevTools automatically in development. @default true */
  openDevTools: boolean;

  /** URL to load in dev mode. @default 'http://localhost:5173' */
  devUrl: string;
}

/**
 * Full desktop configuration — module options + window config.
 */
export interface DesktopConfig {
  /** Module options passed to DesktopModule.forRoot(). */
  module: DesktopModuleOptions;

  /** Electron BrowserWindow configuration. */
  window: WindowConfig;
}

/*
|--------------------------------------------------------------------------
| Default Configuration
|--------------------------------------------------------------------------
*/

export const desktopConfig: DesktopConfig = {
  /*
  |--------------------------------------------------------------------------
  | Module Options
  |--------------------------------------------------------------------------
  |
  | Passed to DesktopModule.forRoot(). Controls the DI-side behavior:
  | app name, title bar style, auto-update, tray, etc.
  |
  */
  module: {
    appName: 'Stackra',
    titleBarStyle: 'hiddenInset',
    autoUpdate: false,
    tray: false,
    devToolsInProduction: false,
    devUrl: 'http://localhost:5173',
  },

  /*
  |--------------------------------------------------------------------------
  | Window Options
  |--------------------------------------------------------------------------
  |
  | Maps directly to Electron BrowserWindow constructor options.
  | The main process reads these via 'window:config' IPC.
  |
  */
  window: {
    /*
    |--------------------------------------------------------------------------
    | Dimensions
    |--------------------------------------------------------------------------
    */
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,

    /*
    |--------------------------------------------------------------------------
    | Appearance
    |--------------------------------------------------------------------------
    */
    title: 'Stackra',
    backgroundColor: '#18181b',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },

    /*
    |--------------------------------------------------------------------------
    | Security
    |--------------------------------------------------------------------------
    */
    contextIsolation: true,
    nodeIntegration: false,

    /*
    |--------------------------------------------------------------------------
    | Dev
    |--------------------------------------------------------------------------
    */
    openDevTools: true,
    devUrl: 'http://localhost:5173',
  },
};

export default desktopConfig;

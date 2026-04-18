/**
 * Desktop Module Options
 *
 * |--------------------------------------------------------------------------
 * | Configuration for DesktopModule.forRoot().
 * |--------------------------------------------------------------------------
 * |
 * | Core fields control the Electron window and app behavior.
 * | Optional domain fields configure POS hardware, offline/sync,
 * | security, crash reporting, and other services.
 * |
 * @module @stackra/ts-desktop
 */

import type { PrinterConfig } from './hardware.interface';
import type { CashDrawerConfig } from './hardware.interface';
import type { ScannerConfig } from './hardware.interface';
import type { ScaleConfig } from './hardware.interface';
import type { DisplayConfig } from './hardware.interface';
import type { OfflineConfig } from './offline.interface';
import type { SyncConfig } from './offline.interface';
import type { LockConfig } from './security.interface';
import type { CrashReporterConfig } from './diagnostics.interface';
import type { TrayOptions } from './window.interface';

export interface DesktopModuleOptions {
  /*
  |--------------------------------------------------------------------------
  | Core Fields
  |--------------------------------------------------------------------------
  */

  /** Application name shown in the title bar and dock. */
  appName: string;

  /** Title bar style. 'native' uses OS chrome, 'hidden' for custom title bar. */
  titleBarStyle?: 'native' | 'hidden' | 'hiddenInset';

  /** Default window width. @default 1280 */
  width?: number;

  /** Default window height. @default 800 */
  height?: number;

  /** Minimum window width. @default 800 */
  minWidth?: number;

  /** Minimum window height. @default 600 */
  minHeight?: number;

  /** Enable auto-update via electron-updater. @default false */
  autoUpdate?: boolean;

  /** Show system tray icon. @default false */
  tray?: boolean;

  /** Enable DevTools in production. @default false */
  devToolsInProduction?: boolean;

  /** URL to load in dev mode. @default 'http://localhost:5173' */
  devUrl?: string;

  /*
  |--------------------------------------------------------------------------
  | POS Hardware
  |--------------------------------------------------------------------------
  */

  /** Printer configuration for ESC/POS receipt printing. */
  printer?: PrinterConfig;

  /** Cash drawer configuration. */
  cashDrawer?: CashDrawerConfig;

  /** Barcode scanner configuration. */
  scanner?: ScannerConfig;

  /** Weight scale configuration. */
  scale?: ScaleConfig;

  /** Customer-facing display configuration. */
  display?: DisplayConfig;

  /*
  |--------------------------------------------------------------------------
  | Offline & Sync
  |--------------------------------------------------------------------------
  */

  /** Offline service configuration. */
  offline?: OfflineConfig;

  /** Sync service configuration (executor is set at runtime). */
  sync?: Omit<SyncConfig, 'executor'>;

  /*
  |--------------------------------------------------------------------------
  | Security
  |--------------------------------------------------------------------------
  */

  /** Lock screen / idle timeout configuration. */
  lock?: LockConfig;

  /*
  |--------------------------------------------------------------------------
  | Crash Reporting
  |--------------------------------------------------------------------------
  */

  /** Crash reporter configuration. */
  crashReporter?: CrashReporterConfig;

  /*
  |--------------------------------------------------------------------------
  | System Integration
  |--------------------------------------------------------------------------
  */

  /** Custom URL protocol scheme (e.g. 'stackra'). */
  protocol?: string;

  /** Tray icon configuration. */
  trayOptions?: TrayOptions;

  /** Notification queue delay in ms. @default 500 */
  notificationDelay?: number;
}

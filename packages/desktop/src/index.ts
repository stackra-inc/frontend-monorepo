/**
 * @stackra/ts-desktop
 *
 * |--------------------------------------------------------------------------
 * | Electron Desktop Integration
 * |--------------------------------------------------------------------------
 * |
 * | Platform-agnostic desktop integration with DI, decorators, and hooks.
 * | 23 injectable services across 7 domains:
 * |
 * |   Core:           DesktopManager, MenuRegistry
 * |   POS Hardware:   PrinterService, EscPosFormatter, CashDrawerService,
 * |                   ScannerService, ScaleService, DisplayService
 * |   Permissions:    PermissionService
 * |   Offline & Sync: OfflineService, SyncService
 * |   Window & Shell: WindowService, TrayService, DockService
 * |   Auto-Update:    AutoUpdateService
 * |   Security:       AuthNativeService, KeychainService, LockService
 * |   System:         ClipboardService, FileSystemService, ProtocolService,
 * |                   PowerService, NotificationService
 * |   Diagnostics:    CrashReporterService, DiagnosticsService
 * |
 * | Module API:
 * |   DesktopModule.forRoot(config)    — register all services
 * |   DesktopModule.forFeature(menus)  — register @Menu classes from modules
 * |   DesktopModule.registerMenu(cls)  — register a single @Menu class
 * |
 * @module @stackra/ts-desktop
 */

import 'reflect-metadata';

// Module
export { DesktopModule, MENU_REGISTRY } from './desktop.module';

// Services — Core
export { DesktopManager, MenuRegistry } from './services';
export type { SerializedMenu, SerializedMenuItem } from './services';

// Services — POS Hardware
export {
  PrinterService,
  EscPosFormatter,
  CashDrawerService,
  ScannerService,
  ScaleService,
  DisplayService,
} from './services';

// Services — Permissions
export { PermissionService } from './services';

// Services — Offline & Sync
export { OfflineService, SyncService } from './services';

// Services — Window & Shell
export { WindowService, TrayService, DockService } from './services';

// Services — Auto-Update
export { AutoUpdateService } from './services';

// Services — Security
export { AuthNativeService, KeychainService, LockService } from './services';

// Services — System Integration
export {
  ClipboardService,
  FileSystemService,
  ProtocolService,
  PowerService,
  NotificationService,
} from './services';

// Services — Updates & Diagnostics
export { CrashReporterService, DiagnosticsService } from './services';

// Bridge
export { ElectronBridge, BrowserBridge } from './bridge';

// Decorators
export { Menu, MenuItem, OnIpc } from './decorators';
export type { OnIpcMetadata } from './decorators';

// Hooks
export { useDesktop, useMenuAction } from './hooks';

// Errors
export { DesktopServiceError, HardwareTimeoutError, HardwareNotConfiguredError } from './errors';

// Interfaces
export type {
  // Core
  DesktopModuleOptions,
  DesktopBridge,
  MenuItemOptions,
  MenuMetadata,
  MenuItemMetadata,
  // POS Hardware
  PrinterConfig,
  PrinterInfo,
  ReceiptData,
  ReceiptItem,
  CashDrawerConfig,
  ScannerConfig,
  ScaleConfig,
  ScaleReading,
  DisplayConfig,
  DisplayInfo,
  // Offline & Sync
  QueuedOperation,
  OfflineConfig,
  SyncConfig,
  SyncProgress,
  // Window & Shell
  ChildWindowOptions,
  WindowInfo,
  TrayOptions,
  TrayMenuTemplate,
  TrayMenuItemOptions,
  // Security
  BiometricResult,
  LockConfig,
  // System Integration
  FileDialogOptions,
  FileResult,
  ParsedProtocolUrl,
  PowerState,
  NotificationOptions,
  DeviceType,
  PermissionState,
  // Diagnostics
  SystemInfo,
  MemoryUsage,
  GpuInfo,
  NetworkStatus,
  CrashReporterConfig,
  // Auto-Update
  UpdateEvent,
  UpdateInfo,
} from './interfaces';

// Constants
export {
  // Core
  DESKTOP_CONFIG,
  DESKTOP_MANAGER,
  MENU_METADATA,
  MENU_ITEM_METADATA,
  ON_IPC_METADATA,
  // POS Hardware
  PRINTER_SERVICE,
  CASH_DRAWER_SERVICE,
  SCANNER_SERVICE,
  SCALE_SERVICE,
  DISPLAY_SERVICE,
  // Permissions
  PERMISSION_SERVICE,
  // Offline & Sync
  OFFLINE_SERVICE,
  SYNC_SERVICE,
  // Window & Shell
  WINDOW_SERVICE,
  TRAY_SERVICE,
  DOCK_SERVICE,
  // Auto-Update
  AUTO_UPDATE_SERVICE,
  // Security
  AUTH_NATIVE_SERVICE,
  KEYCHAIN_SERVICE,
  LOCK_SERVICE,
  // System Integration
  CLIPBOARD_SERVICE,
  FILE_SYSTEM_SERVICE,
  PROTOCOL_SERVICE,
  POWER_SERVICE,
  NOTIFICATION_SERVICE,
  // Updates & Diagnostics
  CRASH_REPORTER_SERVICE,
  DIAGNOSTICS_SERVICE,
} from './constants';

/**
 * DI Tokens for @stackra/ts-desktop
 *
 * |--------------------------------------------------------------------------
 * | Injection tokens and metadata keys.
 * |--------------------------------------------------------------------------
 * |
 * | Core tokens:
 * |   DESKTOP_CONFIG, DESKTOP_MANAGER
 * |
 * | Metadata keys:
 * |   MENU_METADATA, MENU_ITEM_METADATA, SHORTCUT_METADATA, ON_IPC_METADATA
 * |
 * | Service tokens (21 new services):
 * |   POS Hardware, Permissions, Offline & Sync, Window & Shell,
 * |   Security, System Integration, Updates & Diagnostics
 * |
 * @module @stackra/ts-desktop
 */

/*
|--------------------------------------------------------------------------
| Core Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the desktop module configuration. */
export const DESKTOP_CONFIG = Symbol.for('DESKTOP_CONFIG');

/** Injection token for the DesktopManager. */
export const DESKTOP_MANAGER = Symbol.for('DESKTOP_MANAGER');

/*
|--------------------------------------------------------------------------
| Metadata Keys
|--------------------------------------------------------------------------
*/

/** Metadata key for @Menu() decorator. */
export const MENU_METADATA = Symbol.for('MENU_METADATA');

/** Metadata key for @MenuItem() decorator. */
export const MENU_ITEM_METADATA = Symbol.for('MENU_ITEM_METADATA');

/** Metadata key for @Shortcut() decorator. */
export const SHORTCUT_METADATA = Symbol.for('SHORTCUT_METADATA');

/** Metadata key for @OnIpc() decorator. */
export const ON_IPC_METADATA = Symbol.for('ON_IPC_METADATA');

/*
|--------------------------------------------------------------------------
| POS Hardware Service Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the PrinterService. */
export const PRINTER_SERVICE = Symbol.for('PRINTER_SERVICE');

/** Injection token for the CashDrawerService. */
export const CASH_DRAWER_SERVICE = Symbol.for('CASH_DRAWER_SERVICE');

/** Injection token for the ScannerService. */
export const SCANNER_SERVICE = Symbol.for('SCANNER_SERVICE');

/** Injection token for the ScaleService. */
export const SCALE_SERVICE = Symbol.for('SCALE_SERVICE');

/** Injection token for the DisplayService. */
export const DISPLAY_SERVICE = Symbol.for('DISPLAY_SERVICE');

/*
|--------------------------------------------------------------------------
| Permissions Service Token
|--------------------------------------------------------------------------
*/

/** Injection token for the PermissionService. */
export const PERMISSION_SERVICE = Symbol.for('PERMISSION_SERVICE');

/*
|--------------------------------------------------------------------------
| Offline & Sync Service Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the OfflineService. */
export const OFFLINE_SERVICE = Symbol.for('OFFLINE_SERVICE');

/** Injection token for the SyncService. */
export const SYNC_SERVICE = Symbol.for('SYNC_SERVICE');

/*
|--------------------------------------------------------------------------
| Window & Shell Service Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the WindowService. */
export const WINDOW_SERVICE = Symbol.for('WINDOW_SERVICE');

/** Injection token for the TrayService. */
export const TRAY_SERVICE = Symbol.for('TRAY_SERVICE');

/** Injection token for the DockService. */
export const DOCK_SERVICE = Symbol.for('DOCK_SERVICE');

/*
|--------------------------------------------------------------------------
| Auto-Update Service Token
|--------------------------------------------------------------------------
*/

/** Injection token for the AutoUpdateService. */
export const AUTO_UPDATE_SERVICE = Symbol.for('AUTO_UPDATE_SERVICE');

/*
|--------------------------------------------------------------------------
| Security Service Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the AuthNativeService. */
export const AUTH_NATIVE_SERVICE = Symbol.for('AUTH_NATIVE_SERVICE');

/** Injection token for the KeychainService. */
export const KEYCHAIN_SERVICE = Symbol.for('KEYCHAIN_SERVICE');

/** Injection token for the LockService. */
export const LOCK_SERVICE = Symbol.for('LOCK_SERVICE');

/*
|--------------------------------------------------------------------------
| System Integration Service Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the ClipboardService. */
export const CLIPBOARD_SERVICE = Symbol.for('CLIPBOARD_SERVICE');

/** Injection token for the FileSystemService. */
export const FILE_SYSTEM_SERVICE = Symbol.for('FILE_SYSTEM_SERVICE');

/** Injection token for the ProtocolService. */
export const PROTOCOL_SERVICE = Symbol.for('PROTOCOL_SERVICE');

/** Injection token for the PowerService. */
export const POWER_SERVICE = Symbol.for('POWER_SERVICE');

/** Injection token for the NotificationService. */
export const NOTIFICATION_SERVICE = Symbol.for('NOTIFICATION_SERVICE');

/*
|--------------------------------------------------------------------------
| Updates & Diagnostics Service Tokens
|--------------------------------------------------------------------------
*/

/** Injection token for the CrashReporterService. */
export const CRASH_REPORTER_SERVICE = Symbol.for('CRASH_REPORTER_SERVICE');

/** Injection token for the DiagnosticsService. */
export const DIAGNOSTICS_SERVICE = Symbol.for('DIAGNOSTICS_SERVICE');

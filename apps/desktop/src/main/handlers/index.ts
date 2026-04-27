/**
 * Handler Map Barrel
 *
 * |--------------------------------------------------------------------------
 * | Registers all IPC handlers for the main process.
 * |--------------------------------------------------------------------------
 * |
 * | Each domain has its own handler file. This barrel imports them all
 * | and provides a single registerAllHandlers() function.
 * |
 * | Called from main/index.ts after the window is created.
 * |
 * @module desktop/main/handlers
 */

import type { BrowserWindow } from "electron";

import { registerPrinterHandlers } from "./printer.handler";
import { registerCashDrawerHandlers } from "./cash-drawer.handler";
import { registerScaleHandlers } from "./scale.handler";
import { registerDisplayHandlers } from "./display.handler";
import { registerWindowHandlers } from "./window.handler";
import { registerTrayHandlers } from "./tray.handler";
import { registerDockHandlers } from "./dock.handler";
import { registerSecurityHandlers } from "./security.handler";
import { registerPowerHandlers } from "./power.handler";
import { registerProtocolHandlers } from "./protocol.handler";
import { registerPermissionHandlers } from "./permission.handler";
import { registerUpdateHandlers } from "./update.handler";
import { registerDiagnosticsHandlers } from "./diagnostics.handler";
import { registerCrashReporterHandlers } from "./crash-reporter.handler";
import { registerClipboardHandlers } from "./clipboard.handler";
import { registerFileSystemHandlers } from "./file-system.handler";
import { registerNotificationHandlers } from "./notification.handler";

/**
 * Register all domain-specific IPC handlers.
 *
 * @param mainWindow — the main BrowserWindow instance (needed by handlers
 *                     that send events to the renderer or show dialogs).
 */
export function registerAllHandlers(mainWindow: BrowserWindow): void {
  /* POS Hardware */
  registerPrinterHandlers();
  registerCashDrawerHandlers();
  registerScaleHandlers(mainWindow);
  registerDisplayHandlers();

  /* Window & Shell */
  registerWindowHandlers(mainWindow);
  registerTrayHandlers(mainWindow);
  registerDockHandlers();

  /* Security */
  registerSecurityHandlers();

  /* Power */
  registerPowerHandlers();

  /* Protocol */
  registerProtocolHandlers(mainWindow);

  /* Permissions */
  registerPermissionHandlers();

  /* Auto-Update */
  registerUpdateHandlers(mainWindow);

  /* Diagnostics */
  registerDiagnosticsHandlers();

  /* Crash Reporter */
  registerCrashReporterHandlers();

  /* Clipboard */
  registerClipboardHandlers();

  /* File System */
  registerFileSystemHandlers(mainWindow);

  /* Notifications */
  registerNotificationHandlers(mainWindow);

  console.log("[Main] ✅ All domain handlers registered");
}

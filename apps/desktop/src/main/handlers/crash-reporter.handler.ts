/**
 * Crash Reporter IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for crash reporting.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   crash-reporter:start — start the Electron crashReporter
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, crashReporter } from "electron";

export function registerCrashReporterHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | crash-reporter:start
  |--------------------------------------------------------------------------
  |
  | Starts the Electron native crash reporter.
  | This captures native crashes (segfaults, etc.) — not JS errors.
  | JS errors are handled by Sentry in the renderer process.
  |
  */
  ipcMain.handle("crash-reporter:start", async (_event, config: any) => {
    try {
      crashReporter.start({
        submitURL: config.submitURL ?? "",
        productName: config.productName ?? "DesktopApp",
        uploadToServer: !!config.submitURL,
        compress: true,
      });
      console.log("[CrashReporterHandler] Electron crash reporter started");
    } catch (err) {
      console.warn("[CrashReporterHandler] Failed to start crash reporter:", err);
    }
  });
}

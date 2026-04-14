/**
 * Dock IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for macOS dock integration.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   dock:badge  — set the dock badge count
 * |   dock:bounce — trigger a dock icon bounce
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, app } from "electron";

const isMac = process.platform === "darwin";

export function registerDockHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | dock:badge
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("dock:badge", async (_event, count: string) => {
    if (isMac && app.dock) {
      app.dock.setBadge(count === "0" ? "" : count);
    }
  });

  /*
  |--------------------------------------------------------------------------
  | dock:bounce
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("dock:bounce", async (_event, type: string) => {
    if (isMac && app.dock) {
      return app.dock.bounce(type === "critical" ? "critical" : "informational");
    }
    return -1;
  });
}

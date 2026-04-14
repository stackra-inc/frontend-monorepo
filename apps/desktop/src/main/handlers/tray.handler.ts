/**
 * Tray IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for system tray management.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   tray:create  — create a system tray icon
 * |   tray:menu    — set the tray context menu
 * |   tray:badge   — update the tray badge text
 * |   tray:destroy — remove the tray icon
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, Tray, Menu, nativeImage, type BrowserWindow } from "electron";

/** The active tray instance. */
let tray: Tray | null = null;

export function registerTrayHandlers(mainWindow: BrowserWindow): void {
  /*
  |--------------------------------------------------------------------------
  | tray:create
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("tray:create", async (_event, options: { icon: string; tooltip?: string }) => {
    if (tray) tray.destroy();

    const icon = nativeImage.createFromPath(options.icon);
    tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

    if (options.tooltip) {
      tray.setToolTip(options.tooltip);
    }

    /* Click on tray icon shows the main window. */
    tray.on("click", () => {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    console.log("[TrayHandler] Tray created");
  });

  /*
  |--------------------------------------------------------------------------
  | tray:menu
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("tray:menu", async (_event, template: any[]) => {
    if (!tray) return;

    const menuTemplate = template.map((item) => {
      if (item.type === "separator") return { type: "separator" as const };
      return {
        label: item.label,
        click: item.click ? () => mainWindow.webContents.send(item.click) : undefined,
      };
    });

    tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
  });

  /*
  |--------------------------------------------------------------------------
  | tray:badge
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("tray:badge", async (_event, text: string) => {
    if (!tray) return;
    tray.setTitle(text);
  });

  /*
  |--------------------------------------------------------------------------
  | tray:destroy
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("tray:destroy", async () => {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });
}

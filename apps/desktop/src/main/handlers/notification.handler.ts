/**
 * Notification IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for OS notifications.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   notify:show — display an OS notification with optional actions
 * |
 * | Events (main → renderer):
 * |   notify:action — emitted when a notification action is clicked
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, Notification, type BrowserWindow } from "electron";

export function registerNotificationHandlers(mainWindow: BrowserWindow): void {
  /*
  |--------------------------------------------------------------------------
  | notify:show
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("notify:show", async (_event, options: any) => {
    const notif = new Notification({
      title: options.title,
      body: options.body,
      icon: options.icon,
      silent: options.silent ?? !options.sound,
      urgency: options.urgency ?? "normal",
      actions: options.actions?.map((a: any) => ({
        type: "button" as const,
        text: a.label,
      })),
    });

    /* Forward action clicks to the renderer. */
    notif.on("action", (_event, actionIndex) => {
      const actionId = options.actions?.[actionIndex]?.id ?? String(actionIndex);
      mainWindow.webContents.send("notify:action", options.id, actionId);
    });

    notif.on("click", () => {
      mainWindow.webContents.send("notify:action", options.id, "click");
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    });

    notif.show();
    return options.id;
  });
}

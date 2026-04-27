/**
 * Clipboard IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for clipboard access.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   clipboard:write — write text to the system clipboard
 * |   clipboard:read  — read text from the system clipboard
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, clipboard } from "electron";

export function registerClipboardHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | clipboard:write
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("clipboard:write", async (_event, text: string) => {
    clipboard.writeText(text);
  });

  /*
  |--------------------------------------------------------------------------
  | clipboard:read
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("clipboard:read", async () => {
    return clipboard.readText();
  });
}

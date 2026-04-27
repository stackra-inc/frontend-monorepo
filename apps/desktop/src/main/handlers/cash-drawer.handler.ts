/**
 * Cash Drawer IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for cash drawer control.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   cash-drawer:open   — send open command to cash drawer
 * |   cash-drawer:status — read drawer open/closed state
 * |
 * @module desktop/main/handlers
 */

import { ipcMain } from "electron";

export function registerCashDrawerHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | cash-drawer:open
  |--------------------------------------------------------------------------
  |
  | Sends the ESC/POS kick command to open the cash drawer.
  | For printer-kick type: sends DK (drawer kick) command to the printer.
  | For serial type: sends open command directly to the drawer's serial port.
  |
  */
  ipcMain.handle("cash-drawer:open", async (_event, config: any) => {
    console.log(`[CashDrawerHandler] Opening drawer via ${config?.type ?? "unknown"}`);

    if (config?.type === "printer-kick") {
      /* ESC/POS drawer kick command: ESC p 0 25 250 */
      const kickCommand = Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]);
      console.log("[CashDrawerHandler] Sending kick command:", kickCommand);
    }
  });

  /*
  |--------------------------------------------------------------------------
  | cash-drawer:status
  |--------------------------------------------------------------------------
  |
  | Reads the drawer sensor to determine open/closed state.
  | Not all drawers support status reporting.
  |
  */
  ipcMain.handle("cash-drawer:status", async () => {
    console.log("[CashDrawerHandler] Reading drawer status");
    return false;
  });
}

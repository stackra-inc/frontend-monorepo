/**
 * Printer IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for ESC/POS receipt printing.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   printer:print-escpos — send ESC/POS commands to a printer
 * |   printer:list         — enumerate available serial/USB printers
 * |   printer:configure    — store printer configuration
 * |
 * @module desktop/main/handlers
 */

import { ipcMain } from "electron";

/** Stored printer configuration. */
let printerConfig: any = null;

export function registerPrinterHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | printer:print-escpos
  |--------------------------------------------------------------------------
  |
  | Receives ESC/POS byte commands and printer config.
  | Writes to the configured serial port or USB device.
  |
  | In production, integrate with the `serialport` npm package:
  |   const { SerialPort } = require('serialport');
  |   const port = new SerialPort({ path: config.path, baudRate: 9600 });
  |   port.write(Buffer.from(commands));
  |
  */
  ipcMain.handle("printer:print-escpos", async (_event, commands: Uint8Array, config: any) => {
    const cfg = config ?? printerConfig;
    if (!cfg) {
      throw new Error("[PrinterHandler] No printer configured.");
    }

    console.log(
      `[PrinterHandler] Printing ${commands.length} bytes to ${cfg.type}:${cfg.path ?? "default"}`,
    );

    /*
    |--------------------------------------------------------------------------
    | Serial port implementation.
    | Uncomment when serialport is installed:
    |
    | const { SerialPort } = require('serialport');
    | const port = new SerialPort({ path: cfg.path, baudRate: 9600 });
    | await new Promise<void>((resolve, reject) => {
    |   port.write(Buffer.from(commands), (err) => {
    |     if (err) reject(err);
    |     else port.drain(() => { port.close(); resolve(); });
    |   });
    | });
    |--------------------------------------------------------------------------
    */
  });

  /*
  |--------------------------------------------------------------------------
  | printer:list
  |--------------------------------------------------------------------------
  |
  | Enumerates available serial ports and USB devices.
  |
  | In production, use serialport's list():
  |   const { SerialPort } = require('serialport');
  |   const ports = await SerialPort.list();
  |   return ports.map(p => ({ name: p.path, path: p.path, type: 'serial' }));
  |
  */
  ipcMain.handle("printer:list", async () => {
    console.log("[PrinterHandler] Listing available printers");
    return [];
  });

  /*
  |--------------------------------------------------------------------------
  | printer:configure
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("printer:configure", async (_event, config: any) => {
    printerConfig = config;
    console.log("[PrinterHandler] Printer configured:", config);
  });
}

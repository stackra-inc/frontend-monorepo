/**
 * Scale IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for weight scale integration.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   scale:read        — read current weight from scale
 * |   scale:subscribe   — start continuous weight updates
 * |   scale:unsubscribe — stop continuous weight updates
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, type BrowserWindow } from 'electron';

/** Active scale subscription interval. */
let scaleInterval: ReturnType<typeof setInterval> | null = null;

export function registerScaleHandlers(mainWindow: BrowserWindow): void {
  /*
  |--------------------------------------------------------------------------
  | scale:read
  |--------------------------------------------------------------------------
  |
  | Reads the current weight from the configured serial scale.
  | Returns a ScaleReading object.
  |
  */
  ipcMain.handle('scale:read', async (_event, config: any) => {
    console.log(`[ScaleHandler] Reading weight from ${config?.path ?? 'unknown'}`);

    /*
    |--------------------------------------------------------------------------
    | Serial port implementation.
    | Uncomment when serialport is installed:
    |
    | const { SerialPort, ReadlineParser } = require('serialport');
    | const port = new SerialPort({ path: config.path, baudRate: config.baudRate ?? 9600 });
    | const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    | return new Promise((resolve) => {
    |   parser.once('data', (data) => {
    |     port.close();
    |     resolve(parseScaleData(data, config.protocol));
    |   });
    | });
    |--------------------------------------------------------------------------
    */

    return { weight: 0, unit: 'kg', stable: true };
  });

  /*
  |--------------------------------------------------------------------------
  | scale:subscribe — start continuous weight updates
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('scale:subscribe', async (_event, config: any) => {
    if (scaleInterval) clearInterval(scaleInterval);

    console.log(`[ScaleHandler] Starting weight subscription on ${config?.path ?? 'unknown'}`);

    scaleInterval = setInterval(() => {
      mainWindow.webContents.send('scale:reading', { weight: 0, unit: 'kg', stable: true });
    }, 500);
  });

  /*
  |--------------------------------------------------------------------------
  | scale:unsubscribe — stop continuous weight updates
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('scale:unsubscribe', async () => {
    if (scaleInterval) {
      clearInterval(scaleInterval);
      scaleInterval = null;
    }
    console.log('[ScaleHandler] Stopped weight subscription');
  });
}

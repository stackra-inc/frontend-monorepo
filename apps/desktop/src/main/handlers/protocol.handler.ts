/**
 * Protocol IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for custom URL protocol registration.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   protocol:register — register a custom URL scheme
 * |
 * | Events (main → renderer):
 * |   protocol:url — emitted when the app is opened via a custom URL
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, app, type BrowserWindow } from 'electron';

export function registerProtocolHandlers(mainWindow: BrowserWindow): void {
  /*
  |--------------------------------------------------------------------------
  | protocol:register
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('protocol:register', async (_event, scheme: string) => {
    const success = app.setAsDefaultProtocolClient(scheme);
    console.log(`[ProtocolHandler] Registered protocol "${scheme}":`, success);
  });

  /*
  |--------------------------------------------------------------------------
  | Handle incoming protocol URLs on macOS (open-url event).
  |--------------------------------------------------------------------------
  */
  app.on('open-url', (event, url) => {
    event.preventDefault();
    console.log('[ProtocolHandler] Received protocol URL:', url);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('protocol:url', url);

      /* Bring the window to front. */
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Handle incoming protocol URLs on Windows/Linux (second-instance event).
  |--------------------------------------------------------------------------
  */
  app.on('second-instance', (_event, commandLine) => {
    /* The protocol URL is the last argument. */
    const url = commandLine.find((arg) => arg.includes('://'));
    if (url && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('protocol:url', url);

      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

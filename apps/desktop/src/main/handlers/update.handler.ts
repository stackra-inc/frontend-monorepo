/**
 * Auto-Update IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for application auto-update.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   update:check    — check for available updates
 * |   update:download — download the available update
 * |   update:install  — quit and install the update
 * |   update:rollback — rollback to previous version (if supported)
 * |
 * | Events (main → renderer):
 * |   update:event — lifecycle events (checking, available, downloading, etc.)
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, type BrowserWindow } from 'electron';

/**
 * Attempts to load electron-updater. Returns null if not installed.
 * electron-updater is an optional dependency — not all apps need it.
 */
function loadAutoUpdater(): any {
  try {
    return require('electron-updater').autoUpdater;
  } catch {
    console.warn('[UpdateHandler] electron-updater not installed — auto-update disabled.');
    return null;
  }
}

export function registerUpdateHandlers(mainWindow: BrowserWindow): void {
  const autoUpdater = loadAutoUpdater();

  if (!autoUpdater) {
    /* Register no-op handlers so IPC calls don't throw. */
    ipcMain.handle('update:check', async () => null);
    ipcMain.handle('update:download', async () => {});
    ipcMain.handle('update:install', async () => {});
    ipcMain.handle('update:rollback', async () => {});
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Wire up electron-updater events → renderer via IPC.
  |--------------------------------------------------------------------------
  */
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update:event', { type: 'checking' });
  });

  autoUpdater.on('update-available', (info: any) => {
    mainWindow.webContents.send('update:event', { type: 'available', version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update:event', { type: 'not-available' });
  });

  autoUpdater.on('download-progress', (progress: any) => {
    mainWindow.webContents.send('update:event', {
      type: 'downloading',
      progress: progress.percent,
    });
  });

  autoUpdater.on('update-downloaded', (info: any) => {
    mainWindow.webContents.send('update:event', { type: 'downloaded', version: info.version });
  });

  autoUpdater.on('error', (err: Error) => {
    mainWindow.webContents.send('update:event', { type: 'error', error: err.message });
  });

  /*
  |--------------------------------------------------------------------------
  | IPC Handlers
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('update:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      if (result?.updateInfo) {
        return {
          version: result.updateInfo.version,
          releaseNotes: result.updateInfo.releaseNotes,
          releaseDate: result.updateInfo.releaseDate,
        };
      }
      return null;
    } catch (err: any) {
      console.error('[UpdateHandler] Check failed:', err.message);
      return null;
    }
  });

  ipcMain.handle('update:download', async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle('update:install', async () => {
    autoUpdater.quitAndInstall(false, true);
  });

  ipcMain.handle('update:rollback', async () => {
    console.warn('[UpdateHandler] Rollback not natively supported by electron-updater.');
  });
}

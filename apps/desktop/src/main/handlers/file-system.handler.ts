/**
 * File System IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for native file dialogs.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   fs:open — show native file open dialog
 * |   fs:save — show native file save dialog
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, dialog, type BrowserWindow } from 'electron';
import { readFileSync, writeFileSync } from 'fs';

export function registerFileSystemHandlers(mainWindow: BrowserWindow): void {
  /*
  |--------------------------------------------------------------------------
  | fs:open
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('fs:open', async (_event, options: any) => {
    const filters = options?.filters ?? [{ name: 'All Files', extensions: ['*'] }];

    const result = await dialog.showOpenDialog(mainWindow, {
      title: options?.title ?? 'Open File',
      defaultPath: options?.defaultPath,
      filters,
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const content = readFileSync(filePath, 'utf-8');

    return { path: filePath, content };
  });

  /*
  |--------------------------------------------------------------------------
  | fs:save
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('fs:save', async (_event, data: string | Buffer, options: any) => {
    const filters = options?.filters ?? [{ name: 'All Files', extensions: ['*'] }];

    const result = await dialog.showSaveDialog(mainWindow, {
      title: options?.title ?? 'Save File',
      defaultPath: options?.defaultPath,
      filters,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    writeFileSync(result.filePath, data, 'utf-8');
    return result.filePath;
  });
}

/**
 * Window IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for window management.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   window:create     — create a new BrowserWindow
 * |   window:close      — close a window by ID
 * |   window:fullscreen — toggle fullscreen on main window
 * |   window:kiosk      — toggle kiosk mode on main window
 * |   window:list       — list all open windows
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, BrowserWindow } from 'electron';
import { join } from 'path';

/** Map of child window IDs to BrowserWindow instances. */
const childWindows = new Map<string, BrowserWindow>();

/** Auto-incrementing window ID counter. */
let windowIdCounter = 0;

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  /*
  |--------------------------------------------------------------------------
  | window:create
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('window:create', async (_event, options: any) => {
    const id = `window-${++windowIdCounter}`;

    const win = new BrowserWindow({
      width: options.width ?? 800,
      height: options.height ?? 600,
      title: options.title ?? '',
      frame: options.frame ?? true,
      alwaysOnTop: options.alwaysOnTop ?? false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    if (options.url) {
      win.loadURL(options.url);
    }

    childWindows.set(id, win);
    win.on('closed', () => childWindows.delete(id));

    return id;
  });

  /*
  |--------------------------------------------------------------------------
  | window:close
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('window:close', async (_event, id: string) => {
    const win = childWindows.get(id);
    if (win && !win.isDestroyed()) {
      win.close();
    }
  });

  /*
  |--------------------------------------------------------------------------
  | window:fullscreen
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('window:fullscreen', async (_event, enabled: boolean) => {
    mainWindow.setFullScreen(enabled);
  });

  /*
  |--------------------------------------------------------------------------
  | window:kiosk
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('window:kiosk', async (_event, enabled: boolean) => {
    mainWindow.setKiosk(enabled);
  });

  /*
  |--------------------------------------------------------------------------
  | window:list
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('window:list', async () => {
    return BrowserWindow.getAllWindows().map((win) => ({
      id: `window-${win.id}`,
      title: win.getTitle(),
      focused: win.isFocused(),
      fullscreen: win.isFullScreen(),
    }));
  });
}

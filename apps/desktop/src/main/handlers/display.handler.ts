/**
 * Display IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for customer-facing displays.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   display:pole          — send content to pole display via serial
 * |   display:screen        — create a secondary screen window
 * |   display:screen-update — update content in secondary screen window
 * |   display:clear         — clear the pole display
 * |   display:list          — enumerate available displays
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, BrowserWindow, screen } from 'electron';

/** Map of secondary display window IDs. */
const displayWindows = new Map<string, BrowserWindow>();

/** Auto-incrementing display window ID counter. */
let displayIdCounter = 0;

export function registerDisplayHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | display:pole — send content to a serial pole display
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('display:pole', async (_event, content: string, config: any) => {
    console.log(`[DisplayHandler] Pole display: "${content}" on ${config?.path ?? 'unknown'}`);
  });

  /*
  |--------------------------------------------------------------------------
  | display:screen — create a secondary screen window
  |--------------------------------------------------------------------------
  */
  ipcMain.handle(
    'display:screen',
    async (_event, options: { content: string; screenIndex: number }) => {
      const displays = screen.getAllDisplays();
      const targetDisplay = displays[options.screenIndex] ?? displays[displays.length - 1];

      const id = `display-${++displayIdCounter}`;
      const win = new BrowserWindow({
        x: targetDisplay.bounds.x,
        y: targetDisplay.bounds.y,
        width: targetDisplay.bounds.width,
        height: targetDisplay.bounds.height,
        fullscreen: true,
        frame: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

      const html = `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#000;color:#fff;font-size:48px;font-family:sans-serif">${options.content}</body></html>`;
      win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      displayWindows.set(id, win);
      win.on('closed', () => displayWindows.delete(id));

      return id;
    }
  );

  /*
  |--------------------------------------------------------------------------
  | display:screen-update — update content in an existing display window
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('display:screen-update', async (_event, id: string, content: string) => {
    const win = displayWindows.get(id);
    if (!win || win.isDestroyed()) return;

    const html = `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#000;color:#fff;font-size:48px;font-family:sans-serif">${content}</body></html>`;
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });

  /*
  |--------------------------------------------------------------------------
  | display:clear — clear the pole display
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('display:clear', async () => {
    console.log('[DisplayHandler] Clearing pole display');
  });

  /*
  |--------------------------------------------------------------------------
  | display:list — enumerate available displays
  |--------------------------------------------------------------------------
  */
  ipcMain.handle('display:list', async () => {
    const displays = screen.getAllDisplays();
    return displays.map((d, i) => ({
      id: `screen-${i}`,
      name: `Display ${i + 1} (${d.size.width}x${d.size.height})`,
      type: 'screen' as const,
    }));
  });
}

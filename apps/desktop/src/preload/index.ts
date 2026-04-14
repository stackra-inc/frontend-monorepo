/**
 * Electron Preload Script
 *
 * |--------------------------------------------------------------------------
 * | Security boundary between main process (Node.js) and renderer (browser).
 * |--------------------------------------------------------------------------
 * |
 * | Exposes window.electronAPI via contextBridge.
 * | The renderer can ONLY access what's explicitly exposed here.
 * |
 * | Three generic methods handle ALL IPC channels:
 * |   invoke(channel, ...args) — request/response (ipcRenderer.invoke)
 * |   send(channel, ...args)   — fire-and-forget (ipcRenderer.send)
 * |   on(channel, callback)    — listen for main→renderer events
 * |
 * | No per-channel entries needed — services use bridge.invoke('domain:action').
 * |
 * @module desktop/preload
 */

import { contextBridge, ipcRenderer } from "electron";

/*
|--------------------------------------------------------------------------
| Channel Allowlist
|--------------------------------------------------------------------------
|
| Only these channel prefixes are allowed through the bridge.
| This prevents the renderer from invoking arbitrary IPC channels.
|
*/
const ALLOWED_INVOKE_PREFIXES = [
  "get-app-version",
  "print-receipt",
  "export-file",
  "notify",
  "menu:",
  "printer:",
  "cash-drawer:",
  "scale:",
  "display:",
  "window:",
  "tray:",
  "dock:",
  "auth:",
  "keychain:",
  "power:",
  "protocol:",
  "permission:",
  "update:",
  "diagnostics:",
  "crash-reporter:",
  "clipboard:",
  "fs:",
  "notify:",
];

const ALLOWED_SEND_PREFIXES = ["window:config", "menu:set"];

const ALLOWED_ON_PREFIXES = ["menu:", "protocol:", "update:", "notify:", "scale:"];

function isAllowed(channel: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => channel === prefix || channel.startsWith(prefix));
}

/*
|--------------------------------------------------------------------------
| Expose safe API to the renderer process.
|--------------------------------------------------------------------------
*/
contextBridge.exposeInMainWorld("electronAPI", {
  /*
  |--------------------------------------------------------------------------
  | App Info
  |--------------------------------------------------------------------------
  */
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  /*
  |--------------------------------------------------------------------------
  | Legacy convenience methods (used by existing DesktopBridge interface)
  |--------------------------------------------------------------------------
  */
  print: (html: string) => ipcRenderer.invoke("print-receipt", html),
  openCashDrawer: () => ipcRenderer.invoke("cash-drawer:open", {}),
  exportFile: (data: string, filename: string) => ipcRenderer.invoke("export-file", data, filename),
  notify: (title: string, body: string) => ipcRenderer.invoke("notify", title, body),
  checkForUpdates: () => ipcRenderer.invoke("update:check"),

  /*
  |--------------------------------------------------------------------------
  | Generic IPC — handles ALL channels via allowlist
  |--------------------------------------------------------------------------
  */
  send: (channel: string, ...args: unknown[]) => {
    if (isAllowed(channel, ALLOWED_SEND_PREFIXES)) {
      ipcRenderer.send(channel, ...args);
    } else {
      console.warn(`[Preload] Blocked send to unauthorized channel: ${channel}`);
    }
  },

  invoke: <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
    if (isAllowed(channel, ALLOWED_INVOKE_PREFIXES)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    console.warn(`[Preload] Blocked invoke to unauthorized channel: ${channel}`);
    return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
  },

  /**
   * Listen for messages from the main process.
   * Returns an unsubscribe function.
   */
  on: (channel: string, callback: (...args: unknown[]) => void): (() => void) => {
    if (!isAllowed(channel, ALLOWED_ON_PREFIXES)) {
      console.warn(`[Preload] Blocked listener on unauthorized channel: ${channel}`);
      return () => {};
    }

    const handler = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
});

/**
 * Electron Main Process
 *
 * |--------------------------------------------------------------------------
 * | Production-ready Electron shell for the Stackra app.
 * |--------------------------------------------------------------------------
 * |
 * | Features:
 * |   - Single instance lock (prevents duplicate app windows)
 * |   - Security hardening (CSP, sandbox, permission handling)
 * |   - Window state persistence (remembers size/position)
 * |   - Graceful error handling with crash reporting
 * |   - Dev/prod mode detection with proper file loading
 * |   - Dynamic menu from renderer via IPC
 * |   - Handler map pattern for all domain IPC handlers
 * |
 * @module desktop/main
 */

import { app, BrowserWindow, shell, ipcMain, Menu, Notification, dialog, session } from "electron";
import { join } from "path";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";

import { registerAllHandlers } from "./handlers";

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";

/*
|--------------------------------------------------------------------------
| Single Instance Lock
|--------------------------------------------------------------------------
|
| Prevents multiple instances of the app from running simultaneously.
| If a second instance is launched, focus the existing window instead.
|
*/
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

/*
|--------------------------------------------------------------------------
| Window State Persistence
|--------------------------------------------------------------------------
|
| Saves and restores window size/position across app restarts.
| State is stored in the app's userData directory.
|
*/
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const stateFilePath = join(app.getPath("userData"), "window-state.json");

function loadWindowState(): WindowState {
  try {
    if (existsSync(stateFilePath)) {
      return JSON.parse(readFileSync(stateFilePath, "utf-8"));
    }
  } catch {
    /* Corrupted state file — use defaults. */
  }
  return { width: 1280, height: 800, isMaximized: false };
}

function saveWindowState(win: BrowserWindow): void {
  try {
    const bounds = win.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: win.isMaximized(),
    };
    const dir = app.getPath("userData");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(stateFilePath, JSON.stringify(state));
  } catch {
    /* Non-critical — silently ignore. */
  }
}

/*
|--------------------------------------------------------------------------
| Default Window Config
|--------------------------------------------------------------------------
|
| Used before the renderer sends the real config via 'window:config' IPC.
| Overridden by desktop.config.ts at runtime.
|
*/
let windowConfig = {
  title: "Stackra",
  backgroundColor: "#000000",
  titleBarStyle: "hiddenInset" as const,
  trafficLightPosition: { x: 15, y: 15 },
  minWidth: 800,
  minHeight: 600,
  devUrl: "http://localhost:5173",
};

/*
|--------------------------------------------------------------------------
| Main Window
|--------------------------------------------------------------------------
*/

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const savedState = loadWindowState();

  mainWindow = new BrowserWindow({
    x: savedState.x,
    y: savedState.y,
    width: savedState.width,
    height: savedState.height,
    minWidth: windowConfig.minWidth,
    minHeight: windowConfig.minHeight,
    title: windowConfig.title,
    backgroundColor: windowConfig.backgroundColor,
    titleBarStyle: windowConfig.titleBarStyle,
    trafficLightPosition: windowConfig.trafficLightPosition,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Restore maximized state.
  |--------------------------------------------------------------------------
  */
  if (savedState.isMaximized) {
    mainWindow.maximize();
  }

  /*
  |--------------------------------------------------------------------------
  | Show window when ready to prevent visual flash.
  |--------------------------------------------------------------------------
  */
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  /*
  |--------------------------------------------------------------------------
  | Load the app — dev server URL or production build.
  |--------------------------------------------------------------------------
  */
  if (isDev) {
    mainWindow.loadURL(windowConfig.devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../../renderer/index.html"));
  }

  /*
  |--------------------------------------------------------------------------
  | Security: open external links in the default browser.
  |--------------------------------------------------------------------------
  */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  /*
  |--------------------------------------------------------------------------
  | Security: block navigation to external URLs in the main window.
  |--------------------------------------------------------------------------
  */
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const appUrl = isDev ? windowConfig.devUrl : "file://";
    if (!url.startsWith(appUrl)) {
      event.preventDefault();
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Save window state on resize/move/close.
  |--------------------------------------------------------------------------
  */
  mainWindow.on("resize", () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      saveWindowState(mainWindow);
    }
  });

  mainWindow.on("move", () => {
    if (mainWindow && !mainWindow.isMaximized()) {
      saveWindowState(mainWindow);
    }
  });

  mainWindow.on("close", () => {
    if (mainWindow) saveWindowState(mainWindow);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/*
|--------------------------------------------------------------------------
| Dynamic Menu (from renderer via IPC)
|--------------------------------------------------------------------------
*/

interface SerializedMenuItem {
  label?: string;
  accelerator?: string;
  type?: string;
  role?: string;
  enabled?: boolean;
  visible?: boolean;
  ipcChannel?: string;
}

interface SerializedMenu {
  id: string;
  label: string;
  order: number;
  items: SerializedMenuItem[];
}

function buildMenuFromTemplate(menus: SerializedMenu[]): void {
  const template: Electron.MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  for (const menu of menus) {
    const submenu: Electron.MenuItemConstructorOptions[] = [];
    for (const item of menu.items) {
      if (item.role) {
        submenu.push({ role: item.role as any });
      } else if (item.type === "separator") {
        submenu.push({ type: "separator" });
      } else {
        submenu.push({
          label: item.label,
          accelerator: item.accelerator,
          enabled: item.enabled ?? true,
          visible: item.visible ?? true,
          click: item.ipcChannel ? () => mainWindow?.webContents.send(item.ipcChannel!) : undefined,
        });
      }
    }
    template.push({ label: menu.label, submenu });
  }

  template.push({
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      ...(isMac
        ? [{ type: "separator" as const }, { role: "front" as const }]
        : [{ role: "close" as const }]),
    ],
  });

  if (!isMac) {
    template.push({
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: () => shell.openExternal("https://stackra.com/docs"),
        },
        {
          label: `About v${app.getVersion()}`,
          click: () =>
            dialog.showMessageBox({
              type: "info",
              title: "About",
              message: `${windowConfig.title} v${app.getVersion()}`,
              detail: "Built with Electron + Vite + React",
            }),
        },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/*
|--------------------------------------------------------------------------
| Core IPC Handlers
|--------------------------------------------------------------------------
|
| These handle the core app lifecycle IPC channels.
| Domain-specific handlers (POS, security, etc.) are in ./handlers/.
|
*/

function registerCoreHandlers(): void {
  ipcMain.handle("get-app-version", () => app.getVersion());

  ipcMain.on("window:config", (_event, config: Record<string, unknown>) => {
    windowConfig = { ...windowConfig, ...config } as typeof windowConfig;

    /*
    |--------------------------------------------------------------------------
    | Apply config to the existing window if it's already created.
    | This handles the case where the renderer sends config after window creation.
    |--------------------------------------------------------------------------
    */
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (config.title) mainWindow.setTitle(config.title as string);
      if (config.backgroundColor) mainWindow.setBackgroundColor(config.backgroundColor as string);
    }
  });

  ipcMain.on("menu:set", (_event, menus: SerializedMenu[]) => {
    buildMenuFromTemplate(menus);
  });

  ipcMain.handle("menu:get", () => Menu.getApplicationMenu());

  ipcMain.handle("print-receipt", async (_event, html: string) => {
    const win = new BrowserWindow({ show: false });
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    win.webContents.on("did-finish-load", () => {
      win.webContents.print({}, () => win.close());
    });
  });

  ipcMain.handle("export-file", async (_event, data: string, filename: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: filename,
      filters: [
        { name: "CSV", extensions: ["csv"] },
        { name: "JSON", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    if (!result.canceled && result.filePath) {
      writeFileSync(result.filePath, data, "utf-8");
      return result.filePath;
    }
    return null;
  });

  ipcMain.handle("notify", async (_event, title: string, body: string) => {
    new Notification({ title, body }).show();
  });
}

/*
|--------------------------------------------------------------------------
| Security: Permission Request Handler
|--------------------------------------------------------------------------
|
| Controls which permissions the renderer can request.
| Only allow what's explicitly needed.
|
*/
function setupPermissionHandlers(): void {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowedPermissions = [
      "clipboard-read",
      "clipboard-sanitized-write",
      "notifications",
      "fullscreen",
      "media",
    ];

    callback(allowedPermissions.includes(permission));
  });

  /*
  |--------------------------------------------------------------------------
  | Security: Content Security Policy
  |--------------------------------------------------------------------------
  |
  | In production, restrict what the renderer can load.
  | In dev, allow localhost for HMR.
  |
  */
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws://localhost:* http://localhost:*; img-src 'self' data: https:; font-src 'self' data:;"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
  });
}

/*
|--------------------------------------------------------------------------
| Uncaught Exception / Unhandled Rejection Handlers
|--------------------------------------------------------------------------
*/
process.on("uncaughtException", (error) => {
  console.error("[Main] Uncaught exception:", error);
  dialog.showErrorBox(
    "Unexpected Error",
    `An unexpected error occurred:\n\n${error.message}\n\nThe application will continue running.`,
  );
});

process.on("unhandledRejection", (reason) => {
  console.error("[Main] Unhandled rejection:", reason);
});

/*
|--------------------------------------------------------------------------
| App Lifecycle
|--------------------------------------------------------------------------
*/

app.whenReady().then(() => {
  setupPermissionHandlers();
  registerCoreHandlers();
  createWindow();

  if (mainWindow) {
    registerAllHandlers(mainWindow);
  }

  /*
  |--------------------------------------------------------------------------
  | macOS: re-create window when dock icon is clicked and no windows exist.
  |--------------------------------------------------------------------------
  */
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      if (mainWindow) registerAllHandlers(mainWindow);
    }
  });
});

/*
|--------------------------------------------------------------------------
| Second instance handler (for single instance lock + protocol URLs).
|--------------------------------------------------------------------------
*/
app.on("second-instance", (_event, commandLine) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    /* Forward protocol URL if present. */
    const url = commandLine.find((arg) => arg.includes("://"));
    if (url) {
      mainWindow.webContents.send("protocol:url", url);
    }
  }
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});

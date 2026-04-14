/**
 * Electron Main Process
 *
 * |--------------------------------------------------------------------------
 * | Thin shell that wraps the existing Vite app.
 * |--------------------------------------------------------------------------
 * |
 * | Dev:  loads http://localhost:5173 (Vite dev server)
 * | Prod: loads ../vite/dist/index.html (built Vite app)
 * |
 */

import { app, BrowserWindow, shell, ipcMain, Menu, Notification, dialog } from "electron";
import { join } from "path";
import { writeFileSync } from "fs";

const isDev = !app.isPackaged;

/*
|--------------------------------------------------------------------------
| Window
|--------------------------------------------------------------------------
*/

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Pixielity",

    /*
    |--------------------------------------------------------------------------
    | Window Chrome — dark seamless title bar
    |--------------------------------------------------------------------------
    |
    | titleBarStyle: 'hiddenInset' hides the native title bar but keeps
    | the traffic lights (close/min/max) inset into the window content.
    |
    | backgroundColor matches the app's dark background so there's no
    | white flash on load.
    |
    | trafficLightPosition moves the buttons down to align with the
    | web navbar content.
    |
    */
    backgroundColor: "#18181b",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 15, y: 15 },

    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Dev — load from Vite dev server (started by concurrently).
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    // Prod — load the built Vite app.
    // The Vite build output is at ../../apps/vite/dist/ relative to this file,
    // but in the packaged app it's bundled alongside.
    mainWindow.loadFile(join(__dirname, "../../renderer/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/*
|--------------------------------------------------------------------------
| App Menu
|--------------------------------------------------------------------------
*/

function createMenu(): void {
  const isMac = process.platform === "darwin";

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New Order",
          accelerator: "CmdOrCtrl+N",
          click: () => mainWindow?.webContents.send("menu:new-order"),
        },
        {
          label: "Print Receipt",
          accelerator: "CmdOrCtrl+P",
          click: () => mainWindow?.webContents.send("menu:print"),
        },
        { type: "separator" },
        {
          label: "Export Data",
          accelerator: "CmdOrCtrl+E",
          click: () => mainWindow?.webContents.send("menu:export"),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [{ type: "separator" as const }, { role: "front" as const }]
          : [{ role: "close" as const }]),
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: () => shell.openExternal("https://pixielity.com/docs"),
        },
        {
          label: `About Pixielity v${app.getVersion()}`,
          click: () => {
            dialog.showMessageBox({
              type: "info",
              title: "About Pixielity",
              message: `Pixielity Desktop v${app.getVersion()}`,
              detail: "Built with Electron + Vite + React",
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/*
|--------------------------------------------------------------------------
| IPC Handlers
|--------------------------------------------------------------------------
*/

function registerIpcHandlers(): void {
  ipcMain.handle("get-app-version", () => app.getVersion());

  ipcMain.handle("print-receipt", async (_event, html: string) => {
    const win = new BrowserWindow({ show: false });
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    win.webContents.on("did-finish-load", () => {
      win.webContents.print({}, () => win.close());
    });
  });

  ipcMain.handle("open-cash-drawer", async () => {
    console.log("[Main] Cash drawer open command");
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
| App Lifecycle
|--------------------------------------------------------------------------
*/

app.whenReady().then(() => {
  createMenu();
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

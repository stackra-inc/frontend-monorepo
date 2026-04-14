/**
 * Electron Main Process
 *
 * |--------------------------------------------------------------------------
 * | Thin shell that wraps the existing Vite app.
 * |--------------------------------------------------------------------------
 * |
 * | All configuration comes from desktop.config.ts in the app.
 * | The renderer sends config and menu templates via IPC.
 * |
 * | The main process is intentionally dumb — it just applies
 * | what the renderer tells it. All logic lives in the DI system.
 * |
 */

import { app, BrowserWindow, shell, ipcMain, Menu, Notification, dialog } from "electron";
import { join } from "path";
import { writeFileSync } from "fs";

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";

/*
|--------------------------------------------------------------------------
| Default window config — used before renderer sends the real config.
| These are overridden by desktop.config.ts via 'window:config' IPC.
|--------------------------------------------------------------------------
*/
let windowConfig = {
  width: 1280,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  title: "Pixielity",
  backgroundColor: "#18181b",
  titleBarStyle: "hiddenInset" as const,
  trafficLightPosition: { x: 15, y: 15 },
  contextIsolation: true,
  nodeIntegration: false,
  openDevTools: true,
  devUrl: "http://localhost:5173",
};

/*
|--------------------------------------------------------------------------
| Window
|--------------------------------------------------------------------------
*/

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: windowConfig.width,
    height: windowConfig.height,
    minWidth: windowConfig.minWidth,
    minHeight: windowConfig.minHeight,
    title: windowConfig.title,
    backgroundColor: windowConfig.backgroundColor,
    titleBarStyle: windowConfig.titleBarStyle,
    trafficLightPosition: windowConfig.trafficLightPosition,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: windowConfig.contextIsolation,
      nodeIntegration: windowConfig.nodeIntegration,
    },
  });

  if (isDev) {
    mainWindow.loadURL(windowConfig.devUrl);
    if (windowConfig.openDevTools) {
      mainWindow.webContents.openDevTools();
    }
  } else {
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

  template.push({
    label: "Help",
    submenu: [
      { label: "Documentation", click: () => shell.openExternal("https://pixielity.com/docs") },
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

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/*
|--------------------------------------------------------------------------
| IPC Handlers
|--------------------------------------------------------------------------
*/

function registerIpcHandlers(): void {
  ipcMain.handle("get-app-version", () => app.getVersion());

  /*
  |--------------------------------------------------------------------------
  | window:config — receive window config from renderer
  |--------------------------------------------------------------------------
  */
  ipcMain.on("window:config", (_event, config: typeof windowConfig) => {
    console.log("[Main] Received window:config:", config.title);
    windowConfig = { ...windowConfig, ...config };
  });

  /*
  |--------------------------------------------------------------------------
  | menu:set — receive menu template from renderer
  |--------------------------------------------------------------------------
  */
  ipcMain.on("menu:set", (_event, menus: SerializedMenu[]) => {
    console.log("[Main] Received menu:set:", menus.map((m) => m.label).join(", "));
    buildMenuFromTemplate(menus);
    console.log("[Main] ✅ Native menu rebuilt");
  });

  ipcMain.handle("menu:get", () => Menu.getApplicationMenu());

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
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

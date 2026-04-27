/**
 * Permission IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for device permission management.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   permission:request — prompt for device permission
 * |   permission:check   — check current permission status
 * |   permission:revoke  — revoke a device permission
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, systemPreferences } from "electron";

const isMac = process.platform === "darwin";

export function registerPermissionHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | permission:request
  |--------------------------------------------------------------------------
  |
  | On macOS: uses systemPreferences.askForMediaAccess() for camera/mic.
  | Other device types return 'granted' (Electron has full access).
  |
  */
  ipcMain.handle("permission:request", async (_event, deviceType: string) => {
    if (isMac && (deviceType === "camera" || deviceType === "microphone")) {
      const granted = await systemPreferences.askForMediaAccess(
        deviceType === "camera" ? "camera" : "microphone",
      );
      return granted ? "granted" : "denied";
    }

    /* USB, Bluetooth, Serial: Electron has full access by default. */
    if (["usb", "bluetooth", "serial"].includes(deviceType)) {
      return "granted";
    }

    return "unsupported";
  });

  /*
  |--------------------------------------------------------------------------
  | permission:check
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("permission:check", async (_event, deviceType: string) => {
    if (isMac && (deviceType === "camera" || deviceType === "microphone")) {
      const status = systemPreferences.getMediaAccessStatus(
        deviceType === "camera" ? "camera" : "microphone",
      );
      return status === "granted" ? "granted" : status === "denied" ? "denied" : "prompt";
    }

    if (["usb", "bluetooth", "serial"].includes(deviceType)) {
      return "granted";
    }

    return "unsupported";
  });

  /*
  |--------------------------------------------------------------------------
  | permission:revoke
  |--------------------------------------------------------------------------
  |
  | Permission revocation is handled at the OS level.
  | We can only log a message directing the user to system settings.
  |
  */
  ipcMain.handle("permission:revoke", async (_event, deviceType: string) => {
    console.log(
      `[PermissionHandler] Permission revocation for "${deviceType}" must be done in System Settings.`,
    );
  });
}

/**
 * Security IPC Handlers
 *
 * |--------------------------------------------------------------------------
 * | Main process handlers for biometric auth and keychain.
 * |--------------------------------------------------------------------------
 * |
 * | Channels:
 * |   auth:biometric           — prompt for biometric authentication
 * |   auth:biometric-available — check if biometric auth is supported
 * |   keychain:set             — store a credential in the OS keychain
 * |   keychain:get             — retrieve a credential from the OS keychain
 * |   keychain:delete          — delete a credential from the OS keychain
 * |
 * @module desktop/main/handlers
 */

import { ipcMain, systemPreferences } from "electron";
import { safeStorage } from "electron";
import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "fs";
import { app } from "electron";

const isMac = process.platform === "darwin";

/*
|--------------------------------------------------------------------------
| Keychain storage directory (fallback using safeStorage).
|--------------------------------------------------------------------------
|
| Uses Electron's safeStorage API to encrypt credentials at rest.
| Stored in the app's userData directory.
|
*/
const keychainDir = join(app.getPath("userData"), "keychain");

export function registerSecurityHandlers(): void {
  /*
  |--------------------------------------------------------------------------
  | auth:biometric — prompt for Touch ID / Windows Hello
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("auth:biometric", async (_event, reason: string) => {
    if (isMac) {
      try {
        await systemPreferences.promptTouchID(reason);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message ?? "Authentication failed" };
      }
    }

    return { success: false, error: "Biometric authentication not supported on this platform." };
  });

  /*
  |--------------------------------------------------------------------------
  | auth:biometric-available
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("auth:biometric-available", async () => {
    if (isMac) {
      return systemPreferences.canPromptTouchID();
    }
    return false;
  });

  /*
  |--------------------------------------------------------------------------
  | keychain:set — store encrypted credential
  |--------------------------------------------------------------------------
  */
  ipcMain.handle(
    "keychain:set",
    async (_event, service: string, account: string, password: string) => {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error("[SecurityHandler] Encryption not available on this system.");
      }

      if (!existsSync(keychainDir)) {
        mkdirSync(keychainDir, { recursive: true });
      }

      const encrypted = safeStorage.encryptString(password);
      const filePath = join(keychainDir, `${service}_${account}.enc`);
      writeFileSync(filePath, encrypted);
    },
  );

  /*
  |--------------------------------------------------------------------------
  | keychain:get — retrieve encrypted credential
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("keychain:get", async (_event, service: string, account: string) => {
    const filePath = join(keychainDir, `${service}_${account}.enc`);

    if (!existsSync(filePath)) {
      return null;
    }

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("[SecurityHandler] Encryption not available on this system.");
    }

    const encrypted = readFileSync(filePath);
    return safeStorage.decryptString(encrypted);
  });

  /*
  |--------------------------------------------------------------------------
  | keychain:delete — remove encrypted credential
  |--------------------------------------------------------------------------
  */
  ipcMain.handle("keychain:delete", async (_event, service: string, account: string) => {
    const filePath = join(keychainDir, `${service}_${account}.enc`);

    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  });
}

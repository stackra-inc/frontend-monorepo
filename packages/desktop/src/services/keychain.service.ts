/**
 * Keychain Service
 *
 * |--------------------------------------------------------------------------
 * | Secure credential storage in the OS keychain.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: uses OS keychain (Keychain on macOS, Credential Manager
 * | on Windows, libsecret on Linux) via IPC.
 * |
 * | In browser: falls back to localStorage with a security warning.
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DesktopManager } from './desktop-manager.service';

/** localStorage key prefix for browser fallback. */
const BROWSER_KEY_PREFIX = 'desktop-keychain:';

@Injectable()
export class KeychainService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | setCredential
  |--------------------------------------------------------------------------
  */
  async setCredential(service: string, account: string, password: string): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[KeychainService] Using localStorage fallback — less secure than OS keychain.');
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${BROWSER_KEY_PREFIX}${service}:${account}`, password);
      }
      return;
    }
    await this.desktop.bridge.invoke('keychain:set', service, account, password);
  }

  /*
  |--------------------------------------------------------------------------
  | getCredential
  |--------------------------------------------------------------------------
  */
  async getCredential(service: string, account: string): Promise<string | null> {
    if (!this.desktop.isDesktop) {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(`${BROWSER_KEY_PREFIX}${service}:${account}`);
      }
      return null;
    }
    return this.desktop.bridge.invoke<string | null>('keychain:get', service, account);
  }

  /*
  |--------------------------------------------------------------------------
  | deleteCredential
  |--------------------------------------------------------------------------
  */
  async deleteCredential(service: string, account: string): Promise<void> {
    if (!this.desktop.isDesktop) {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`${BROWSER_KEY_PREFIX}${service}:${account}`);
      }
      return;
    }
    await this.desktop.bridge.invoke('keychain:delete', service, account);
  }
}

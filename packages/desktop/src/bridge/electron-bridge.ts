/**
 * Electron Bridge
 *
 * Real implementation that communicates with the Electron main process
 * via the preload-exposed window.electronAPI.
 *
 * @module @stackra/ts-desktop
 */

import type { DesktopBridge } from '@/interfaces';

/** The shape of window.electronAPI exposed by the preload script. */
interface ElectronAPI {
  getAppVersion(): string;
  print(html: string): Promise<void>;
  openCashDrawer(): Promise<void>;
  exportFile(data: string, filename: string): Promise<string | null>;
  notify(title: string, body: string): Promise<void>;
  checkForUpdates(): Promise<{ available: boolean; version?: string } | null>;
  send(channel: string, ...args: unknown[]): void;
  invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export class ElectronBridge implements DesktopBridge {
  readonly isDesktop = true;

  private get api(): ElectronAPI {
    if (!window.electronAPI) {
      throw new Error(
        '[DesktopBridge] window.electronAPI not available. Is the preload script loaded?'
      );
    }
    return window.electronAPI;
  }

  getAppVersion(): string {
    return this.api.getAppVersion();
  }

  async print(html: string): Promise<void> {
    return this.api.print(html);
  }

  async openCashDrawer(): Promise<void> {
    return this.api.openCashDrawer();
  }

  async exportFile(data: string, filename: string): Promise<string | null> {
    return this.api.exportFile(data, filename);
  }

  async notify(title: string, body: string): Promise<void> {
    return this.api.notify(title, body);
  }

  async checkForUpdates(): Promise<{ available: boolean; version?: string } | null> {
    return this.api.checkForUpdates();
  }

  onMenuAction(channel: string, callback: (...args: unknown[]) => void): () => void {
    return this.api.on(channel, callback);
  }

  send(channel: string, ...args: unknown[]): void {
    this.api.send(channel, ...args);
  }

  async invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
    return this.api.invoke<T>(channel, ...args);
  }
}

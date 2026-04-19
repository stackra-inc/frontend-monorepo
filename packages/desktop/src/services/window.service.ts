/**
 * Window Service
 *
 * |--------------------------------------------------------------------------
 * | Manages multiple Electron windows, fullscreen, and kiosk mode.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: creates/closes BrowserWindows via IPC.
 * | In browser: uses Fullscreen API where applicable, warns for the rest.
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import type { ChildWindowOptions, WindowInfo } from '@/interfaces/window.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class WindowService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | createWindow
  |--------------------------------------------------------------------------
  */
  async createWindow(options: ChildWindowOptions): Promise<string> {
    if (!this.desktop.isDesktop) {
      console.warn('[WindowService] createWindow not available in browser.');
      return '';
    }
    return this.desktop.bridge.invoke<string>('window:create', options);
  }

  /*
  |--------------------------------------------------------------------------
  | closeWindow
  |--------------------------------------------------------------------------
  */
  async closeWindow(id: string): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('window:close', id);
  }

  /*
  |--------------------------------------------------------------------------
  | setFullscreen
  |--------------------------------------------------------------------------
  */
  async setFullscreen(enabled: boolean): Promise<void> {
    if (!this.desktop.isDesktop) {
      /* Browser fallback: use Fullscreen API. */
      if (enabled) {
        await document.documentElement.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
      return;
    }
    await this.desktop.bridge.invoke('window:fullscreen', enabled);
  }

  /*
  |--------------------------------------------------------------------------
  | setKioskMode
  |--------------------------------------------------------------------------
  */
  async setKioskMode(enabled: boolean): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[WindowService] Kiosk mode not available in browser.');
      return;
    }
    await this.desktop.bridge.invoke('window:kiosk', enabled);
  }

  /*
  |--------------------------------------------------------------------------
  | getWindows
  |--------------------------------------------------------------------------
  */
  async getWindows(): Promise<WindowInfo[]> {
    if (!this.desktop.isDesktop) return [];
    return this.desktop.bridge.invoke<WindowInfo[]>('window:list');
  }
}

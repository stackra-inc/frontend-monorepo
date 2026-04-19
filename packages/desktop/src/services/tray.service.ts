/**
 * Tray Service
 *
 * |--------------------------------------------------------------------------
 * | System tray icon and context menu management.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: creates/manages the system tray via IPC.
 * | In browser: resolves without error, logs a warning.
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import type { TrayOptions, TrayMenuTemplate } from '@/interfaces/window.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class TrayService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  async createTray(options: TrayOptions): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[TrayService] System tray not available in browser.');
      return;
    }
    await this.desktop.bridge.invoke('tray:create', options);
  }

  async setContextMenu(template: TrayMenuTemplate): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('tray:menu', template);
  }

  async setBadge(text: string): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('tray:badge', text);
  }

  async destroyTray(): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('tray:destroy');
  }
}

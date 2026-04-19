/**
 * Auto-Update Service
 *
 * |--------------------------------------------------------------------------
 * | Checks, downloads, installs, and rolls back application updates.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: uses electron-updater via IPC to the main process.
 * | In browser: returns null / no-op for all methods.
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject, type OnModuleInit } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { UpdateEvent, UpdateInfo } from '@/interfaces/update.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class AutoUpdateService implements OnModuleInit {
  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(DESKTOP_CONFIG) private readonly config: DesktopModuleOptions
  ) {}

  /*
  |--------------------------------------------------------------------------
  | onModuleInit — auto-check if config.autoUpdate is true
  |--------------------------------------------------------------------------
  */
  onModuleInit(): void {
    if (this.config.autoUpdate && this.desktop.isDesktop) {
      this.checkForUpdates().catch((err) => {
        console.warn('[AutoUpdateService] Auto-check failed:', err);
      });
    }
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    if (!this.desktop.isDesktop) return null;
    return this.desktop.bridge.invoke<UpdateInfo | null>('update:check');
  }

  async downloadUpdate(): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('update:download');
  }

  async installUpdate(): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('update:install');
  }

  async rollback(): Promise<void> {
    if (!this.desktop.isDesktop) return;
    await this.desktop.bridge.invoke('update:rollback');
  }

  onUpdateEvent(callback: (event: UpdateEvent) => void): () => void {
    if (!this.desktop.isDesktop) return () => {};
    return this.desktop.bridge.onMenuAction('update:event', (...args: unknown[]) => {
      callback(args[0] as UpdateEvent);
    });
  }
}

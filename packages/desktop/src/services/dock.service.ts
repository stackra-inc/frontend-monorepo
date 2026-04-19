/**
 * Dock Service
 *
 * |--------------------------------------------------------------------------
 * | macOS dock badge and bounce notifications.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron on macOS: updates dock badge and triggers bounce.
 * | On non-macOS or browser: resolves without error, logs a warning.
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class DockService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  async setBadge(count: number): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[DockService] Dock badge not available in browser.');
      return;
    }
    await this.desktop.bridge.invoke('dock:badge', String(count));
  }

  async bounce(type: 'informational' | 'critical' = 'informational'): Promise<number> {
    if (!this.desktop.isDesktop) {
      console.warn('[DockService] Dock bounce not available in browser.');
      return -1;
    }
    return this.desktop.bridge.invoke<number>('dock:bounce', type);
  }
}

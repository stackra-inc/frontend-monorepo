/**
 * Display Service
 *
 * |--------------------------------------------------------------------------
 * | Customer-facing display management (pole display or second screen).
 * |--------------------------------------------------------------------------
 * |
 * | In Electron:
 * |   - Pole display: sends content to a serial-connected pole display.
 * |   - Second screen: renders content in a secondary BrowserWindow.
 * |
 * | In browser: logs a warning, resolves without error.
 * |
 * | Usage:
 * |   const display = container.get(DisplayService);
 * |   display.configureDisplay({ type: 'screen', screenIndex: 1 });
 * |   await display.showOnDisplay('Total: $42.50');
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { DisplayConfig, DisplayInfo } from '@/interfaces/hardware.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class DisplayService {
  /** Current display configuration. */
  private config: DisplayConfig | null = null;

  /** ID of the secondary screen window (if type is 'screen'). */
  private screenWindowId: string | null = null;

  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions
  ) {
    if (this.moduleConfig.display) {
      this.config = this.moduleConfig.display;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | showOnDisplay
  |--------------------------------------------------------------------------
  |
  | Shows content on the configured customer-facing display.
  |
  | Pole display: sends serial commands via IPC.
  | Second screen: creates or updates a secondary BrowserWindow.
  |
  */
  async showOnDisplay(content: string): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[DisplayService] Customer display not available in browser.');
      return;
    }

    if (!this.config) {
      console.warn('[DisplayService] No display configured.');
      return;
    }

    if (this.config.type === 'pole') {
      await this.desktop.bridge.invoke('display:pole', content, this.config);
    } else {
      /* Second screen: create a window or update existing one. */
      if (this.screenWindowId) {
        await this.desktop.bridge.invoke('display:screen-update', this.screenWindowId, content);
      } else {
        this.screenWindowId = await this.desktop.bridge.invoke<string>('display:screen', {
          content,
          screenIndex: this.config.screenIndex ?? 1,
        });
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | clearDisplay
  |--------------------------------------------------------------------------
  */
  async clearDisplay(): Promise<void> {
    if (!this.desktop.isDesktop) return;

    if (!this.config) return;

    if (this.config.type === 'pole') {
      await this.desktop.bridge.invoke('display:clear');
    } else if (this.screenWindowId) {
      await this.desktop.bridge.invoke('window:close', this.screenWindowId);
      this.screenWindowId = null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | getAvailableDisplays
  |--------------------------------------------------------------------------
  */
  async getAvailableDisplays(): Promise<DisplayInfo[]> {
    if (!this.desktop.isDesktop) return [];
    return this.desktop.bridge.invoke<DisplayInfo[]>('display:list');
  }

  /*
  |--------------------------------------------------------------------------
  | configureDisplay
  |--------------------------------------------------------------------------
  */
  configureDisplay(config: DisplayConfig): void {
    this.config = config;
  }
}

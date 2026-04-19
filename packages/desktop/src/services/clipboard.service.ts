/**
 * Clipboard Service
 *
 * |--------------------------------------------------------------------------
 * | System clipboard read/write access.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: uses the Electron clipboard API via IPC.
 * | In browser: uses navigator.clipboard API.
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class ClipboardService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  async writeText(text: string): Promise<void> {
    if (this.desktop.isDesktop) {
      await this.desktop.bridge.invoke('clipboard:write', text);
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  async readText(): Promise<string> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<string>('clipboard:read');
    }
    return navigator.clipboard.readText();
  }
}

/**
 * Cash Drawer Service
 *
 * |--------------------------------------------------------------------------
 * | Controls a cash drawer via serial or printer-kick command.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: sends open command via IPC to the main process.
 * | In browser: logs a warning and resolves without error.
 * |
 * | Usage:
 * |   const drawer = container.get(CashDrawerService);
 * |   drawer.configureDrawer({ type: 'printer-kick' });
 * |   await drawer.openDrawer();
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { CashDrawerConfig } from '@/interfaces/hardware.interface';
import { DesktopManager } from './desktop-manager.service';
import { HardwareNotConfiguredError, HardwareTimeoutError } from '@/errors';

/** Default timeout for cash drawer operations in ms. */
const DRAWER_TIMEOUT_MS = 5000;

@Injectable()
export class CashDrawerService {
  /** Current drawer configuration. */
  private config: CashDrawerConfig | null = null;

  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions
  ) {
    /*
    |--------------------------------------------------------------------------
    | Apply config from module options if provided.
    |--------------------------------------------------------------------------
    */
    if (this.moduleConfig.cashDrawer) {
      this.config = this.moduleConfig.cashDrawer;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | openDrawer
  |--------------------------------------------------------------------------
  |
  | Sends the open command to the cash drawer.
  | Times out after 5 seconds if the drawer doesn't respond.
  |
  */
  async openDrawer(): Promise<void> {
    if (!this.desktop.isDesktop) {
      console.warn('[CashDrawerService] Cash drawer not available in browser.');
      return;
    }

    this.ensureConfigured();

    const result = await Promise.race([
      this.desktop.bridge.invoke('cash-drawer:open', this.config),
      this.timeout(DRAWER_TIMEOUT_MS),
    ]);

    return result as void;
  }

  /*
  |--------------------------------------------------------------------------
  | isDrawerOpen
  |--------------------------------------------------------------------------
  |
  | Returns the current open/closed state of the cash drawer
  | if the hardware supports status reporting.
  |
  */
  async isDrawerOpen(): Promise<boolean> {
    if (!this.desktop.isDesktop) {
      return false;
    }

    this.ensureConfigured();
    return this.desktop.bridge.invoke<boolean>('cash-drawer:status');
  }

  /*
  |--------------------------------------------------------------------------
  | configureDrawer
  |--------------------------------------------------------------------------
  |
  | Stores the drawer configuration for subsequent operations.
  |
  */
  configureDrawer(config: CashDrawerConfig): void {
    this.config = config;
  }

  /*
  |--------------------------------------------------------------------------
  | Private Helpers
  |--------------------------------------------------------------------------
  */

  /** Throws if no drawer is configured. */
  private ensureConfigured(): void {
    if (!this.config) {
      throw new HardwareNotConfiguredError('CashDrawerService');
    }
  }

  /** Returns a promise that rejects after the given timeout. */
  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new HardwareTimeoutError('CashDrawerService', 'openDrawer', ms));
      }, ms);
    });
  }
}

/**
 * Power Service
 *
 * |--------------------------------------------------------------------------
 * | Prevents system sleep and detects power state.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: uses powerSaveBlocker and powerMonitor via IPC.
 * | In browser: uses Screen Wake Lock API where available.
 * |
 * | Usage:
 * |   const power = container.get(PowerService);
 * |   const blockerId = await power.preventSleep();
 * |   // ... later
 * |   await power.allowSleep(blockerId);
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import type { PowerState } from '@/interfaces/system.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class PowerService {
  /** Browser Wake Lock sentinel (if active). */
  private wakeLock: WakeLockSentinel | null = null;

  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | preventSleep
  |--------------------------------------------------------------------------
  |
  | Prevents the system from sleeping.
  |
  | Electron: uses powerSaveBlocker.start(), returns blocker ID.
  | Browser: uses Screen Wake Lock API, returns 0 as a placeholder ID.
  |
  */
  async preventSleep(): Promise<number> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<number>('power:prevent-sleep');
    }

    /* Browser fallback: Screen Wake Lock API. */
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        return 0;
      } catch (err) {
        console.warn('[PowerService] Wake Lock request failed:', err);
        return -1;
      }
    }

    console.warn('[PowerService] Wake Lock API not available in this browser.');
    return -1;
  }

  /*
  |--------------------------------------------------------------------------
  | allowSleep
  |--------------------------------------------------------------------------
  |
  | Releases the power save blocker.
  |
  | Electron: uses powerSaveBlocker.stop(blockerId).
  | Browser: releases the Wake Lock sentinel.
  |
  */
  async allowSleep(blockerId: number): Promise<void> {
    if (this.desktop.isDesktop) {
      await this.desktop.bridge.invoke('power:allow-sleep', blockerId);
      return;
    }

    /* Browser fallback: release Wake Lock. */
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | getPowerState
  |--------------------------------------------------------------------------
  |
  | Returns the current power state.
  |
  | Electron: queries powerMonitor via IPC.
  | Browser: returns 'unknown' (no browser API for this).
  |
  */
  async getPowerState(): Promise<PowerState> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<PowerState>('power:state');
    }
    return 'unknown';
  }
}

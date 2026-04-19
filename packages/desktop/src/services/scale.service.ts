/**
 * Scale Service
 *
 * |--------------------------------------------------------------------------
 * | Weight scale integration via serial port.
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: reads weight data from a serial-connected scale via IPC.
 * | In browser: returns a rejected promise (hardware not available).
 * |
 * | Usage:
 * |   const scale = container.get(ScaleService);
 * |   scale.configureScale({ path: '/dev/ttyUSB0', protocol: 'toledo' });
 * |   const reading = await scale.readWeight();
 * |   console.log(`${reading.weight} ${reading.unit}`);
 * |
 * @module @stackra-inc/ts-desktop
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';

import { DESKTOP_CONFIG } from '@/constants';
import type { DesktopModuleOptions } from '@/interfaces/desktop-module-options.interface';
import type { ScaleConfig, ScaleReading } from '@/interfaces/hardware.interface';
import { DesktopManager } from './desktop-manager.service';
import { HardwareNotConfiguredError, HardwareTimeoutError, DesktopServiceError } from '@/errors';

/** Default timeout for scale read operations in ms. */
const SCALE_TIMEOUT_MS = 3000;

@Injectable()
export class ScaleService {
  /** Current scale configuration. */
  private config: ScaleConfig | null = null;

  constructor(
    @Inject(DesktopManager) private readonly desktop: DesktopManager,
    @Inject(DESKTOP_CONFIG) private readonly moduleConfig: DesktopModuleOptions
  ) {
    if (this.moduleConfig.scale) {
      this.config = this.moduleConfig.scale;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | readWeight
  |--------------------------------------------------------------------------
  |
  | Reads the current weight from the configured scale.
  | Times out after 3 seconds if the scale doesn't respond.
  |
  */
  async readWeight(): Promise<ScaleReading> {
    if (!this.desktop.isDesktop) {
      throw new DesktopServiceError('ScaleService', 'Scale hardware not available in browser.');
    }

    this.ensureConfigured();

    const result = await Promise.race([
      this.desktop.bridge.invoke<ScaleReading>('scale:read', this.config),
      this.timeout(SCALE_TIMEOUT_MS),
    ]);

    return result as ScaleReading;
  }

  /*
  |--------------------------------------------------------------------------
  | onWeightChange
  |--------------------------------------------------------------------------
  |
  | Subscribes to continuous weight updates from the scale.
  | Returns an unsubscribe function.
  |
  */
  onWeightChange(callback: (reading: ScaleReading) => void): () => void {
    if (!this.desktop.isDesktop) {
      console.warn('[ScaleService] Scale not available in browser.');
      return () => {};
    }

    this.ensureConfigured();

    /* Start the subscription on the main process side. */
    this.desktop.bridge.invoke('scale:subscribe', this.config).catch((err) => {
      console.error('[ScaleService] Failed to start weight subscription:', err);
    });

    /* Listen for weight readings from the main process. */
    const unsub = this.desktop.bridge.onMenuAction('scale:reading', (...args: unknown[]) => {
      callback(args[0] as ScaleReading);
    });

    return () => {
      unsub();
      this.desktop.bridge.invoke('scale:unsubscribe').catch(() => {});
    };
  }

  /*
  |--------------------------------------------------------------------------
  | configureScale
  |--------------------------------------------------------------------------
  */
  configureScale(config: ScaleConfig): void {
    this.config = config;
  }

  /*
  |--------------------------------------------------------------------------
  | Private Helpers
  |--------------------------------------------------------------------------
  */

  private ensureConfigured(): void {
    if (!this.config) {
      throw new HardwareNotConfiguredError('ScaleService');
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new HardwareTimeoutError('ScaleService', 'readWeight', ms));
      }, ms);
    });
  }
}

/**
 * Auth Native Service
 *
 * |--------------------------------------------------------------------------
 * | Biometric authentication (Touch ID, Windows Hello).
 * |--------------------------------------------------------------------------
 * |
 * | In Electron: prompts for biometric auth via IPC.
 * | In browser: returns { success: false, error: 'not available' }.
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import type { BiometricResult } from '@/interfaces/security.interface';
import { DesktopManager } from './desktop-manager.service';

@Injectable()
export class AuthNativeService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | authenticate
  |--------------------------------------------------------------------------
  */
  async authenticate(reason: string): Promise<BiometricResult> {
    if (!this.desktop.isDesktop) {
      return { success: false, error: 'Biometric authentication not available in browser.' };
    }
    return this.desktop.bridge.invoke<BiometricResult>('auth:biometric', reason);
  }

  /*
  |--------------------------------------------------------------------------
  | isAvailable
  |--------------------------------------------------------------------------
  */
  async isAvailable(): Promise<boolean> {
    if (!this.desktop.isDesktop) return false;
    return this.desktop.bridge.invoke<boolean>('auth:biometric-available');
  }
}

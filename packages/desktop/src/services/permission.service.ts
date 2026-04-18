/**
 * Permission Service
 *
 * |--------------------------------------------------------------------------
 * | Centralized device permission management.
 * |--------------------------------------------------------------------------
 * |
 * | Manages permissions for USB, Bluetooth, Serial, Camera, and Microphone.
 * |
 * | In Electron: uses systemPreferences via IPC.
 * | In browser: uses Web Permissions API where available.
 * |
 * | Usage:
 * |   const perms = container.get(PermissionService);
 * |   const status = await perms.requestPermission('camera');
 * |   if (status === 'granted') { ... }
 * |
 * @module @stackra/ts-desktop
 */

import { Injectable, Inject } from '@stackra/ts-container';

import type { DeviceType, PermissionState } from '@/interfaces/system.interface';
import { DesktopManager } from './desktop-manager.service';

/**
 * Maps our DeviceType to the Web Permissions API name.
 * Not all device types have a browser equivalent.
 */
const BROWSER_PERMISSION_MAP: Partial<Record<DeviceType, PermissionName>> = {
  camera: 'camera' as PermissionName,
  microphone: 'microphone' as PermissionName,
};

@Injectable()
export class PermissionService {
  constructor(@Inject(DesktopManager) private readonly desktop: DesktopManager) {}

  /*
  |--------------------------------------------------------------------------
  | requestPermission
  |--------------------------------------------------------------------------
  |
  | Prompts the user for permission to access the specified device type.
  |
  */
  async requestPermission(deviceType: DeviceType): Promise<PermissionState> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<PermissionState>('permission:request', deviceType);
    }

    return this.browserRequestPermission(deviceType);
  }

  /*
  |--------------------------------------------------------------------------
  | checkPermission
  |--------------------------------------------------------------------------
  |
  | Returns the current permission status without prompting.
  |
  */
  async checkPermission(deviceType: DeviceType): Promise<PermissionState> {
    if (this.desktop.isDesktop) {
      return this.desktop.bridge.invoke<PermissionState>('permission:check', deviceType);
    }

    return this.browserCheckPermission(deviceType);
  }

  /*
  |--------------------------------------------------------------------------
  | revokePermission
  |--------------------------------------------------------------------------
  |
  | Revokes a previously granted permission.
  |
  */
  async revokePermission(deviceType: DeviceType): Promise<void> {
    if (this.desktop.isDesktop) {
      await this.desktop.bridge.invoke('permission:revoke', deviceType);
      return;
    }

    console.warn('[PermissionService] Permission revocation not available in browser.');
  }

  /*
  |--------------------------------------------------------------------------
  | Browser Fallbacks
  |--------------------------------------------------------------------------
  */

  /** Request permission via browser APIs. */
  private async browserRequestPermission(deviceType: DeviceType): Promise<PermissionState> {
    /*
    |--------------------------------------------------------------------------
    | Camera and microphone: use getUserMedia to trigger the prompt.
    |--------------------------------------------------------------------------
    */
    if (deviceType === 'camera' || deviceType === 'microphone') {
      try {
        const constraints: MediaStreamConstraints =
          deviceType === 'camera' ? { video: true } : { audio: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        /* Stop all tracks immediately — we just needed the permission. */
        for (const track of stream.getTracks()) {
          track.stop();
        }
        return 'granted';
      } catch {
        return 'denied';
      }
    }

    /*
    |--------------------------------------------------------------------------
    | USB, Bluetooth, Serial: not available via standard browser APIs.
    |--------------------------------------------------------------------------
    */
    return 'unsupported';
  }

  /** Check permission status via browser Permissions API. */
  private async browserCheckPermission(deviceType: DeviceType): Promise<PermissionState> {
    const permName = BROWSER_PERMISSION_MAP[deviceType];
    if (!permName || !('permissions' in navigator)) {
      return 'unsupported';
    }

    try {
      const status = await navigator.permissions.query({ name: permName });
      return this.mapBrowserPermission(status.state);
    } catch {
      return 'unsupported';
    }
  }

  /** Map browser PermissionState to our PermissionState. */
  private mapBrowserPermission(state: globalThis.PermissionState): PermissionState {
    switch (state) {
      case 'granted':
        return 'granted';
      case 'denied':
        return 'denied';
      case 'prompt':
        return 'prompt';
      default:
        return 'unsupported';
    }
  }
}

/**
 * @fileoverview Desktop Update Service
 *
 * Integrates server-driven app update notifications with Electron's
 * auto-update system. When the renderer process receives an update
 * notification on the `app.updates` broadcasting channel, this service
 * triggers the main process to check for Electron updates via the
 * `electron-updater` IPC channel.
 *
 * For mandatory updates, the service instructs the main process to
 * show a native dialog prompting the user to install the update.
 *
 * @module @stackra/ts-desktop
 * @category Services
 */

import type { DesktopBridge } from '@/interfaces';

// ── IPC Channel Constants ───────────────────────────────────────────────────

/**
 * IPC channel to trigger an update check in the main process.
 * The main process handler should invoke `electron-updater`'s
 * `autoUpdater.checkForUpdates()`.
 */
export const CHECK_FOR_UPDATES_CHANNEL = 'app:check-for-updates';

/**
 * IPC channel to show a native update dialog in the main process.
 * Used for mandatory updates that require immediate installation.
 */
export const SHOW_UPDATE_DIALOG_CHANNEL = 'app:show-update-dialog';

// ── Interfaces ──────────────────────────────────────────────────────────────

/**
 * Payload received from the `app.updates` broadcasting channel.
 * Matches the `AppUpdateEvent` broadcast payload from the backend.
 */
export interface AppUpdatePayload {
  /** The new application version number */
  version: string;
  /** Whether the update is mandatory */
  mandatory: boolean;
  /** Desktop update download URL */
  desktop_update_url: string;
  /** Release notes URL */
  release_notes_url: string;
  /** Whether a desktop update is available */
  desktop_available: boolean;
  /** Server timestamp of the update */
  timestamp: number;
}

// ── Service ─────────────────────────────────────────────────────────────────

/**
 * Desktop auto-update integration service.
 *
 * Bridges server-driven update notifications from the `SettingsSyncService`
 * with Electron's native auto-update system (`electron-updater`). When a
 * desktop update notification is received:
 *
 * 1. Checks if the update is relevant to the desktop platform
 * 2. Triggers the main process to check for Electron updates
 * 3. For mandatory updates, shows a native dialog via the main process
 *
 * @example
 * ```typescript
 * const updateService = new DesktopUpdateService(bridge);
 *
 * // Handle incoming update notification from SettingsSyncService
 * syncService.on('app_version', (changes) => {
 *   updateService.handleUpdateNotification({
 *     version: changes.values.current_version,
 *     mandatory: changes.values.mandatory,
 *     desktop_update_url: changes.values.desktop_update_url,
 *     release_notes_url: changes.values.release_notes_url,
 *     desktop_available: changes.values.desktop_update_available,
 *     timestamp: Date.now(),
 *   });
 * });
 * ```
 */
export class DesktopUpdateService {
  /**
   * Create a new DesktopUpdateService.
   *
   * @param bridge - The desktop bridge for IPC communication with the main process
   */
  constructor(private readonly bridge: DesktopBridge) {}

  /**
   * Handle an incoming app update notification.
   *
   * Checks if the notification is relevant to the desktop platform
   * and triggers the appropriate update flow:
   *
   * - **Desktop available**: Triggers an update check in the main process
   *   via `electron-updater`.
   * - **Mandatory**: Additionally shows a native dialog prompting
   *   immediate installation.
   *
   * @param payload - The update notification payload from the broadcasting channel
   */
  async handleUpdateNotification(payload: AppUpdatePayload): Promise<void> {
    // Only process if a desktop update is available
    if (!payload.desktop_available) return;

    // Trigger the main process to check for Electron updates
    await this.bridge.invoke(CHECK_FOR_UPDATES_CHANNEL, {
      version: payload.version,
      updateUrl: payload.desktop_update_url,
      releaseNotesUrl: payload.release_notes_url,
    });

    // For mandatory updates, show a native dialog that blocks until installed
    if (payload.mandatory) {
      await this.bridge.invoke(SHOW_UPDATE_DIALOG_CHANNEL, {
        version: payload.version,
        mandatory: true,
        releaseNotesUrl: payload.release_notes_url,
      });
    }
  }

  /**
   * Manually check for desktop updates.
   *
   * Triggers the main process to check for available Electron updates
   * without a server-driven notification. Useful for a "Check for Updates"
   * menu item in the desktop app.
   *
   * @returns The update check result from the main process
   */
  async checkForUpdates(): Promise<{ available: boolean; version?: string } | null> {
    return this.bridge.checkForUpdates();
  }
}

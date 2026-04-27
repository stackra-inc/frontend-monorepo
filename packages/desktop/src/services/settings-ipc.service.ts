/**
 * @fileoverview Settings IPC Service
 *
 * Provides settings operations via the Electron IPC bridge. When running
 * in the desktop app, this service proxies settings reads and writes
 * through the `settings:get`, `settings:update`, and `settings:schema`
 * IPC channels exposed by the main process.
 *
 * The main process handlers are registered in the Electron app's main
 * entry point and proxy requests to the backend API or a local store.
 *
 * @module @stackra/ts-desktop
 * @category Services
 */

import type { DesktopBridge } from '@/interfaces';

// ── IPC Channel Constants ───────────────────────────────────────────────────

/**
 * IPC channel for reading settings by group.
 * Main process handler should return the settings values for the group.
 */
export const SETTINGS_GET_CHANNEL = 'settings:get';

/**
 * IPC channel for updating settings by group.
 * Main process handler should persist the values and return the merged result.
 */
export const SETTINGS_UPDATE_CHANNEL = 'settings:update';

/**
 * IPC channel for retrieving the full settings schema.
 * Main process handler should return the schema for admin UI rendering.
 */
export const SETTINGS_SCHEMA_CHANNEL = 'settings:schema';

// ── Interfaces ──────────────────────────────────────────────────────────────

/**
 * Response shape for settings:get IPC calls.
 */
export interface SettingsGetResponse {
  /** The settings group key */
  group: string;
  /** The resolved settings values */
  values: Record<string, unknown>;
}

/**
 * Response shape for settings:update IPC calls.
 */
export interface SettingsUpdateResponse {
  /** The settings group key */
  group: string;
  /** The full merged settings values after update */
  values: Record<string, unknown>;
  /** Whether the update was successful */
  success: boolean;
}

// ── Service ─────────────────────────────────────────────────────────────────

/**
 * Desktop settings IPC service.
 *
 * Wraps the Electron IPC bridge to provide typed settings operations
 * for the renderer process. Falls back gracefully when the bridge is
 * not available (e.g., running in a browser during development).
 *
 * @example
 * ```typescript
 * const service = new SettingsIpcService(bridge);
 *
 * // Read settings
 * const theme = await service.get('theme');
 * console.log(theme.values.accent);
 *
 * // Update settings
 * const result = await service.update('theme', { accent: 'oklch(0.7 0.2 260)' });
 *
 * // Get schema
 * const schema = await service.getSchema();
 * ```
 */
export class SettingsIpcService {
  /**
   * Create a new SettingsIpcService.
   *
   * @param bridge - The desktop bridge for IPC communication.
   *                 Must support the `invoke()` method for async IPC calls.
   */
  constructor(private readonly bridge: DesktopBridge) {}

  /**
   * Get settings values for a group via IPC.
   *
   * Invokes the `settings:get` channel on the main process, which
   * either reads from a local store or proxies to the backend API.
   *
   * @param group - The settings group key (e.g., 'theme', 'preferences')
   * @returns The settings values for the group
   * @throws If the IPC call fails or the bridge is unavailable
   */
  async get(group: string): Promise<SettingsGetResponse> {
    return this.bridge.invoke<SettingsGetResponse>(SETTINGS_GET_CHANNEL, group);
  }

  /**
   * Update settings values for a group via IPC.
   *
   * Invokes the `settings:update` channel on the main process, which
   * persists the values (locally or via API) and returns the merged result.
   *
   * @param group - The settings group key
   * @param values - The partial set of field values to update
   * @returns The full merged settings values after the update
   * @throws If the IPC call fails or the bridge is unavailable
   */
  async update(group: string, values: Record<string, unknown>): Promise<SettingsUpdateResponse> {
    return this.bridge.invoke<SettingsUpdateResponse>(SETTINGS_UPDATE_CHANNEL, group, values);
  }

  /**
   * Get the full settings schema via IPC.
   *
   * Invokes the `settings:schema` channel on the main process, which
   * returns the complete schema for admin UI rendering.
   *
   * @returns The full settings schema with all groups and field definitions
   * @throws If the IPC call fails or the bridge is unavailable
   */
  async getSchema(): Promise<unknown> {
    return this.bridge.invoke(SETTINGS_SCHEMA_CHANNEL);
  }
}

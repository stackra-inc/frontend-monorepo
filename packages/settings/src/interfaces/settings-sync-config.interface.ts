/**
 * @fileoverview Settings sync configuration interface.
 *
 * Defines the configuration for the {@link SettingsSyncService}, including
 * which groups to fetch on initialization, update strategies per group,
 * and the platform-specific storage adapter for offline caching.
 *
 * @module @stackra/ts-settings
 * @category Interfaces
 */

/**
 * Strategy for applying real-time settings updates.
 *
 * Controls when incoming changes from the broadcasting channel are
 * applied to the local state. Similar to Firebase Remote Config's
 * fetch/activate pattern.
 *
 * - `'immediate'` — Apply changes to local state instantly on receive.
 *   Best for theme tokens, UI config where the user should see changes live.
 *
 * - `'nextOpen'` — Cache changes locally, apply on next app open or page load.
 *   Best for breaking changes or layout shifts that would disrupt the active session.
 *
 * - `'manual'` — Cache changes, expose via `getPending()` and `applyPending()`.
 *   Consumer decides when to apply. Best for critical settings where the app
 *   needs to confirm before applying.
 *
 * - `'debounced'` — Batch rapid changes, apply after a quiet period.
 *   Best when an admin is making multiple quick edits — avoids flickering.
 *
 * @example
 * ```ts
 * sync: {
 *   groups: ['theme', 'notifications', 'layout'],
 *   defaultStrategy: 'immediate',
 *   groupStrategies: {
 *     layout: 'nextOpen',
 *     notifications: 'manual',
 *   },
 * }
 * ```
 */
export type UpdateStrategy = 'immediate' | 'nextOpen' | 'manual' | 'debounced';

/**
 * Configuration for the {@link SettingsSyncService}.
 *
 * Passed to `SettingsModule.forRoot({ sync: { ... } })` to enable
 * real-time settings synchronization via `@stackra/ts-realtime`.
 *
 * @description
 * When a `sync` config is provided to `forRoot()`, the module registers
 * the `SettingsSyncService` and a `RealtimeStore` driver, enabling
 * automatic fetching of configured groups on init and real-time
 * subscription to setting changes via Laravel Broadcasting.
 *
 * @example
 * ```ts
 * SettingsModule.forRoot({
 *   default: 'local',
 *   stores: { local: { driver: 'localStorage' } },
 *   sync: {
 *     groups: ['theme', 'notifications', 'layout'],
 *     defaultStrategy: 'immediate',
 *     groupStrategies: {
 *       layout: 'nextOpen',
 *       notifications: 'manual',
 *     },
 *     debounceMs: 500,
 *     storageAdapter: 'localStorage',
 *   },
 * })
 * ```
 */
export interface SettingsSyncConfig {
  /**
   * Settings groups to fetch from the API on initialization.
   *
   * Each group key corresponds to a backend `#[AsSetting]` group
   * (e.g., `'theme'`, `'notifications'`, `'app_version'`).
   */
  groups: string[];

  /**
   * Default update strategy for all groups.
   *
   * Can be overridden per-group via `groupStrategies`.
   *
   * @default 'immediate'
   */
  defaultStrategy?: UpdateStrategy;

  /**
   * Per-group update strategy overrides.
   *
   * Keys are group keys, values are the strategy to use for that group.
   * Groups not listed here use `defaultStrategy`.
   *
   * @example
   * ```ts
   * groupStrategies: {
   *   theme: 'immediate',      // Apply theme changes live
   *   layout: 'nextOpen',      // Apply layout changes on next open
   *   billing: 'manual',       // Let the app decide when to apply
   * }
   * ```
   */
  groupStrategies?: Record<string, UpdateStrategy>;

  /**
   * Debounce delay in milliseconds for the `'debounced'` strategy.
   *
   * When using the `'debounced'` strategy, incoming changes are batched
   * and applied after this quiet period with no new changes.
   *
   * @default 500
   */
  debounceMs?: number;

  /**
   * Platform-specific storage adapter for offline caching.
   *
   * - `'localStorage'` — Web and Electron (default)
   * - `'asyncStorage'` — React Native
   *
   * @default 'localStorage'
   */
  storageAdapter?: 'localStorage' | 'asyncStorage';
}

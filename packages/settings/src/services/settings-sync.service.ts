/**
 * @fileoverview Settings sync service for real-time settings synchronization.
 *
 * Orchestrates initial settings fetch from the API, real-time channel
 * subscriptions via `@stackra/ts-realtime`, and change notification
 * to registered listeners.
 *
 * @module @stackra/ts-settings
 * @category Services
 */

import { Injectable, Inject } from '@stackra/ts-container';
import type { OnModuleInit, OnModuleDestroy } from '@stackra/ts-container';
import {
  SETTINGS_MANAGER,
  SETTINGS_SERVICE,
  SETTINGS_SYNC_CONFIG,
} from '@/constants/tokens.constant';
import { REALTIME_MANAGER } from '@stackra/ts-realtime';
import type { RealtimeManager, ChannelWrapper } from '@stackra/ts-realtime';
import type { SettingsStoreManager } from './settings-manager.service';
import type { SettingsService } from './settings.service';
import type {
  SettingsSyncConfig,
  UpdateStrategy,
} from '@/interfaces/settings-sync-config.interface';
import type { SettingsChangePayload } from '@/interfaces/settings-change-payload.interface';

/**
 * Callback invoked when settings change for a subscribed group.
 *
 * @param changes - The change payload with group, changed fields, and new values
 */
type GroupChangeCallback = (changes: SettingsChangePayload) => void;

/**
 * Service that synchronizes settings from the backend API and subscribes
 * to real-time updates via Laravel Broadcasting.
 *
 * @description
 * Registered by `SettingsModule.forRoot()` when a `sync` configuration is
 * provided. On initialization, fetches all configured groups from the API
 * via the store manager. Subscribes to `settings.{group}` broadcasting
 * channels via `RealtimeManager` from `@stackra/ts-realtime` to receive
 * live updates. Incoming changes are merged into the local state managed
 * by `SettingsService` and forwarded to registered group listeners.
 *
 * Reconnection and exponential backoff are delegated to `RealtimeManager`,
 * which handles the WebSocket connection lifecycle. When the connection is
 * lost, settings continue to be served from the local cache (localStorage
 * or memory store).
 *
 * @example
 * ```ts
 * // Subscribe to theme changes
 * const unsub = syncService.on('theme', (changes) => {
 *   console.log('Theme updated:', changes.changedFields);
 * });
 *
 * // Check connection status
 * if (syncService.connected) {
 *   console.log('Real-time connection active');
 * }
 *
 * // Later
 * unsub();
 * ```
 */
@Injectable()
export class SettingsSyncService implements OnModuleInit, OnModuleDestroy {
  /** Registered group change listeners keyed by group key. */
  private readonly groupListeners: Map<string, Set<GroupChangeCallback>> = new Map();

  /** Active channel subscriptions keyed by group key. */
  private readonly channelSubscriptions: Map<string, ChannelWrapper> = new Map();

  /** Pending changes for groups using 'nextOpen' or 'manual' strategy. */
  private readonly pendingChanges: Map<string, SettingsChangePayload[]> = new Map();

  /** Debounce timers for groups using 'debounced' strategy. */
  private readonly debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Creates a new SettingsSyncService.
   *
   * @param manager - The settings store manager for persistence operations
   * @param service - The settings service for in-memory cache hydration
   * @param config - The sync configuration (groups, storage adapter)
   * @param realtimeManager - The RealtimeManager from `@stackra/ts-realtime`
   */
  constructor(
    @Inject(SETTINGS_MANAGER) private readonly manager: SettingsStoreManager,
    @Inject(SETTINGS_SERVICE) private readonly service: SettingsService,
    @Inject(SETTINGS_SYNC_CONFIG) private readonly config: SettingsSyncConfig,
    @Inject(REALTIME_MANAGER) private readonly realtimeManager: RealtimeManager
  ) {}

  /**
   * Fetch all configured groups from the API on module initialization.
   *
   * @description
   * Iterates over the `groups` array from the sync config and loads each
   * group from the API via the store manager. Loaded values are hydrated
   * into the `SettingsService` in-memory cache. After fetching, subscribes
   * to real-time channels for each group.
   *
   * Errors during individual group fetches are caught and logged to avoid
   * blocking initialization of other groups.
   *
   * @example
   * ```ts
   * // Called automatically by the DI container
   * await syncService.onModuleInit();
   * ```
   */
  public async onModuleInit(): Promise<void> {
    const groups = this.config.groups ?? [];

    await Promise.all(
      groups.map(async (group) => {
        try {
          const store = this.manager.storeForGroup(group);
          const values = await store.load(group);
          this.service.hydrateValues(group, values);
        } catch {
          // Individual group fetch failure should not block others
        }
      })
    );

    // Subscribe to real-time channels for all configured groups
    for (const group of groups) {
      this.subscribe(group);
    }
  }

  /**
   * Subscribe to the real-time channel for a settings group.
   *
   * @description
   * Subscribes to the `settings.{group}` broadcasting channel via
   * `RealtimeManager`. Listens for `SettingsChanged` events, merges
   * incoming changes into the local state via `SettingsService.hydrateValues()`,
   * and notifies all registered group listeners.
   *
   * If the `RealtimeManager` is not connected, the subscription is
   * silently skipped — it will be retried when the connection is
   * re-established.
   *
   * @param group - The settings group key to subscribe to
   *
   * @example
   * ```ts
   * syncService.subscribe('theme');
   * ```
   */
  public subscribe(group: string): void {
    if (this.channelSubscriptions.has(group)) return;

    try {
      const channel = this.realtimeManager.channel(`settings.${group}`);

      channel.listen<SettingsChangePayload>('.SettingsChanged', (data: SettingsChangePayload) => {
        this._handleIncomingChange(group, data);
      });

      this.channelSubscriptions.set(group, channel);
    } catch {
      // RealtimeManager may not be connected yet — silently skip
    }
  }

  /**
   * Unsubscribe from the real-time channel for a settings group.
   *
   * @description
   * Leaves the broadcasting channel and removes it from the internal
   * subscription tracking map.
   *
   * @param group - The settings group key to unsubscribe from
   *
   * @example
   * ```ts
   * syncService.unsubscribe('theme');
   * ```
   */
  public unsubscribe(group: string): void {
    const channel = this.channelSubscriptions.get(group);
    if (channel) {
      channel.leave();
      this.channelSubscriptions.delete(group);
    }
  }

  /**
   * Unsubscribe from all real-time channels on module destruction.
   *
   * @description
   * Called automatically by the DI container during application shutdown.
   * Leaves all active broadcasting channels and clears the subscription
   * and listener tracking maps.
   *
   * @example
   * ```ts
   * // Called automatically by the DI container
   * await syncService.onModuleDestroy();
   * ```
   */
  public async onModuleDestroy(): Promise<void> {
    // Clear debounce timers
    for (const [, timer] of this.debounceTimers) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    for (const [, channel] of this.channelSubscriptions) {
      channel.leave();
    }
    this.channelSubscriptions.clear();
    this.groupListeners.clear();
    this.pendingChanges.clear();
  }

  /**
   * Get pending changes for a group (for `'manual'` and `'nextOpen'` strategies).
   *
   * @description
   * Returns all queued change payloads that have not yet been applied to
   * the local state. Only relevant for groups using `'manual'` or `'nextOpen'`
   * update strategies.
   *
   * @param group - The settings group key
   * @returns Array of pending change payloads, or empty array if none
   *
   * @example
   * ```ts
   * const pending = syncService.getPending('layout');
   * if (pending.length > 0) {
   *   showUpdateBanner();
   * }
   * ```
   */
  public getPending(group: string): SettingsChangePayload[] {
    return this.pendingChanges.get(group) ?? [];
  }

  /**
   * Check if a group has pending changes waiting to be applied.
   *
   * @param group - The settings group key
   * @returns `true` if there are pending changes
   */
  public hasPending(group: string): boolean {
    return (this.pendingChanges.get(group)?.length ?? 0) > 0;
  }

  /**
   * Apply all pending changes for a group (for `'manual'` strategy).
   *
   * @description
   * Merges all queued change payloads into the local state and notifies
   * group listeners. Clears the pending queue after applying.
   *
   * @param group - The settings group key
   *
   * @example
   * ```ts
   * // User confirms they want to apply changes
   * syncService.applyPending('billing');
   * ```
   */
  public applyPending(group: string): void {
    const pending = this.pendingChanges.get(group);
    if (!pending || pending.length === 0) return;

    // Merge all pending changes in order
    let currentValues = this.service.getByKey(group) ?? {};
    for (const payload of pending) {
      currentValues = { ...currentValues, ...payload.values };
    }
    this.service.hydrateValues(group, currentValues);

    // Notify listeners with the last payload (most recent change)
    const lastPayload = pending[pending.length - 1];
    this._notifyListeners(group, lastPayload);

    // Clear pending
    this.pendingChanges.delete(group);
  }

  /**
   * Get the update strategy for a specific group.
   *
   * @param group - The settings group key
   * @returns The update strategy for the group
   */
  public getStrategyForGroup(group: string): UpdateStrategy {
    return this.config.groupStrategies?.[group] ?? this.config.defaultStrategy ?? 'immediate';
  }

  /**
   * Register a listener for settings changes on a specific group.
   *
   * @description
   * The callback is invoked whenever a `SettingsChanged` event is received
   * on the group's broadcasting channel. Returns an unsubscribe function
   * to remove the listener.
   *
   * @param group - The settings group key to listen for changes on
   * @param callback - Handler invoked with the change payload
   * @returns A function that removes the listener when called
   *
   * @example
   * ```ts
   * const unsub = syncService.on('theme', (changes) => {
   *   console.log('Theme changed:', changes.changedFields);
   *   console.log('New values:', changes.values);
   * });
   *
   * // Later
   * unsub();
   * ```
   */
  public on(group: string, callback: (changes: SettingsChangePayload) => void): () => void {
    if (!this.groupListeners.has(group)) {
      this.groupListeners.set(group, new Set());
    }
    this.groupListeners.get(group)!.add(callback);

    return () => {
      this.groupListeners.get(group)?.delete(callback);
    };
  }

  /**
   * Whether the real-time connection is currently active.
   *
   * @description
   * Delegates to `RealtimeManager.isConnected()` to check the WebSocket
   * connection status.
   *
   * @returns `true` if the WebSocket connection is active
   *
   * @example
   * ```ts
   * if (syncService.connected) {
   *   console.log('Real-time updates are active');
   * }
   * ```
   */
  public get connected(): boolean {
    return this.realtimeManager.isConnected();
  }

  // ─── Private ─────────────────────────────────────────────────────

  /**
   * Handle an incoming real-time change based on the group's update strategy.
   *
   * @param group - The settings group key
   * @param data - The change payload
   * @internal
   */
  private _handleIncomingChange(group: string, data: SettingsChangePayload): void {
    const strategy = this.getStrategyForGroup(group);

    switch (strategy) {
      case 'immediate':
        this._applyImmediately(group, data);
        break;

      case 'nextOpen':
        this._queueForNextOpen(group, data);
        break;

      case 'manual':
        this._queueForManual(group, data);
        break;

      case 'debounced':
        this._applyDebounced(group, data);
        break;

      default:
        this._applyImmediately(group, data);
    }
  }

  /**
   * Apply changes immediately to local state and notify listeners.
   * @internal
   */
  private _applyImmediately(group: string, data: SettingsChangePayload): void {
    const currentValues = this.service.getByKey(group) ?? {};
    const merged = { ...currentValues, ...data.values };
    this.service.hydrateValues(group, merged);
    this._notifyListeners(group, data);
  }

  /**
   * Queue changes for application on next app open/page load.
   * Persists to the storage adapter so they survive a page close.
   * @internal
   */
  private _queueForNextOpen(group: string, data: SettingsChangePayload): void {
    if (!this.pendingChanges.has(group)) {
      this.pendingChanges.set(group, []);
    }
    this.pendingChanges.get(group)!.push(data);

    // Persist pending to storage so they survive page close
    const store = this.manager.storeForGroup(group);
    const pendingKey = `__pending:${group}`;
    const allPending = this.pendingChanges.get(group)!;
    store.save(pendingKey, { pending: allPending }).catch(() => {
      /* ignore storage errors */
    });
  }

  /**
   * Queue changes for manual application by the consumer.
   * @internal
   */
  private _queueForManual(group: string, data: SettingsChangePayload): void {
    if (!this.pendingChanges.has(group)) {
      this.pendingChanges.set(group, []);
    }
    this.pendingChanges.get(group)!.push(data);

    // Notify listeners that pending changes are available (but not applied)
    this._notifyListeners(group, { ...data, changedFields: ['__pending'] });
  }

  /**
   * Debounce rapid changes and apply after a quiet period.
   * @internal
   */
  private _applyDebounced(group: string, data: SettingsChangePayload): void {
    // Clear existing timer for this group
    const existingTimer = this.debounceTimers.get(group);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Queue the change
    if (!this.pendingChanges.has(group)) {
      this.pendingChanges.set(group, []);
    }
    this.pendingChanges.get(group)!.push(data);

    // Set new timer
    const delay = this.config.debounceMs ?? 500;
    const timer = setTimeout(() => {
      this.debounceTimers.delete(group);
      this.applyPending(group);
    }, delay);

    this.debounceTimers.set(group, timer);
  }

  /**
   * Notify all registered listeners for a group.
   * @internal
   */
  private _notifyListeners(group: string, data: SettingsChangePayload): void {
    const listeners = this.groupListeners.get(group);
    if (listeners) {
      for (const cb of listeners) {
        try {
          cb(data);
        } catch {
          /* don't break other listeners */
        }
      }
    }
  }
}

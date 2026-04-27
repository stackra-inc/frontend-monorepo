/**
 * @fileoverview Realtime settings store driver.
 *
 * Extends the API store pattern with real-time subscription capabilities
 * via `@stackra/ts-realtime`. Fetches settings from the REST API and
 * subscribes to Laravel Broadcasting channels for live updates.
 *
 * @module @stackra/ts-settings
 * @category Stores
 */

import type { SettingsStore } from '@/interfaces/settings-store.interface';
import type { RealtimeStoreConfig } from '@/interfaces/realtime-store-config.interface';
import type { SettingsChangePayload } from '@/interfaces/settings-change-payload.interface';
import { ApiStore } from './api.store';
import type { RealtimeManager, ChannelWrapper } from '@stackra/ts-realtime';

/**
 * Callback invoked when settings change for a subscribed group.
 *
 * @param payload - The change payload with group, changed fields, and new values
 */
type ChangeCallback = (payload: SettingsChangePayload) => void;

/**
 * Real-time settings store driver.
 *
 * @description
 * Combines REST API persistence (via an internal {@link ApiStore}) with
 * real-time channel subscriptions (via {@link RealtimeManager} from
 * `@stackra/ts-realtime`). When a group is loaded, the store fetches
 * from the API and subscribes to the `settings.{group}` broadcasting
 * channel. Incoming `SettingsChanged` events are merged into the cached
 * values and forwarded to registered change callbacks.
 *
 * Write operations (`save`, `clear`) delegate to the API store — the
 * backend handles broadcasting changes to other clients.
 *
 * @example
 * ```ts
 * const store = new RealtimeStore(config, apiStore, realtimeManager);
 * const values = await store.load('theme');
 *
 * const unsub = store.onChange('theme', (payload) => {
 *   console.log('Theme changed:', payload.changedFields);
 * });
 *
 * // Later
 * unsub();
 * store.unsubscribeAll();
 * ```
 */
export class RealtimeStore implements SettingsStore {
  /** @inheritdoc */
  public readonly driver = 'realtime';

  /** Internal API store for HTTP operations. */
  private readonly apiStore: ApiStore;

  /** Active channel subscriptions keyed by group key. */
  private readonly subscriptions: Map<string, ChannelWrapper> = new Map();

  /** Registered change callbacks keyed by group key. */
  private readonly changeCallbacks: Map<string, Set<ChangeCallback>> = new Map();

  /** Cached values keyed by group key. */
  private readonly cachedValues: Map<string, Record<string, unknown>> = new Map();

  /**
   * Creates a new RealtimeStore.
   *
   * @param config - Realtime store configuration (API base URL, headers, etc.)
   * @param apiStore - The API store instance for HTTP operations
   * @param realtimeManager - The RealtimeManager from `@stackra/ts-realtime`
   *
   * @example
   * ```ts
   * const store = new RealtimeStore(
   *   { driver: 'realtime', baseUrl: '/api/v1/settings' },
   *   apiStore,
   *   realtimeManager,
   * );
   * ```
   */
  constructor(
    private readonly config: RealtimeStoreConfig,
    apiStore: ApiStore,
    private readonly realtimeManager: RealtimeManager
  ) {
    this.apiStore = apiStore;
  }

  /**
   * Load settings for a group from the API and subscribe to real-time updates.
   *
   * @description
   * Fetches the current values from the REST API via the internal
   * {@link ApiStore}, caches them locally, and subscribes to the
   * `settings.{groupKey}` broadcasting channel. Incoming `SettingsChanged`
   * events are merged into the cached values and forwarded to any
   * registered change callbacks.
   *
   * @param groupKey - The settings group key to load
   * @returns The current settings values for the group
   *
   * @example
   * ```ts
   * const values = await store.load('theme');
   * console.log(values.accent); // 'oklch(0.6204 0.195 253.83)'
   * ```
   */
  public async load(groupKey: string): Promise<Record<string, unknown>> {
    const values = await this.apiStore.load(groupKey);
    this.cachedValues.set(groupKey, { ...values });

    // Subscribe to real-time channel if not already subscribed
    this.subscribe(groupKey);

    return values;
  }

  /**
   * Save settings for a group via the API.
   *
   * @description
   * Delegates to the internal {@link ApiStore}. The backend handles
   * broadcasting the change to other connected clients.
   *
   * @param groupKey - The settings group key to save
   * @param values - The values to persist
   *
   * @example
   * ```ts
   * await store.save('theme', { accent: 'oklch(0.7 0.2 260)' });
   * ```
   */
  public async save(groupKey: string, values: Record<string, unknown>): Promise<void> {
    await this.apiStore.save(groupKey, values);
  }

  /**
   * Clear settings for a group via the API and unsubscribe from the channel.
   *
   * @description
   * Delegates the clear operation to the internal {@link ApiStore},
   * removes the cached values, and unsubscribes from the real-time
   * channel for the group.
   *
   * @param groupKey - The settings group key to clear
   *
   * @example
   * ```ts
   * await store.clear('theme');
   * ```
   */
  public async clear(groupKey: string): Promise<void> {
    await this.apiStore.clear(groupKey);
    this.cachedValues.delete(groupKey);
    this.unsubscribe(groupKey);
  }

  /**
   * Subscribe to the real-time channel for a settings group.
   *
   * @description
   * Subscribes to the `settings.{groupKey}` broadcasting channel via
   * {@link RealtimeManager}. Listens for `SettingsChanged` events and
   * merges incoming changes into the cached values, then notifies all
   * registered change callbacks for the group.
   *
   * @param groupKey - The settings group key to subscribe to
   *
   * @example
   * ```ts
   * store.subscribe('theme');
   * ```
   */
  public subscribe(groupKey: string): void {
    if (this.subscriptions.has(groupKey)) return;

    try {
      const channel = this.realtimeManager.channel(`settings.${groupKey}`);

      channel.listen<SettingsChangePayload>('.SettingsChanged', (data: SettingsChangePayload) => {
        // Merge changes into cached values
        const current = this.cachedValues.get(groupKey) ?? {};
        const merged = { ...current, ...data.values };
        this.cachedValues.set(groupKey, merged);

        // Notify change callbacks
        const callbacks = this.changeCallbacks.get(groupKey);
        if (callbacks) {
          for (const cb of callbacks) {
            try {
              cb(data);
            } catch {
              /* don't break other callbacks */
            }
          }
        }
      });

      this.subscriptions.set(groupKey, channel);
    } catch (error) {
      // RealtimeManager may not be connected yet — notify via onError if configured
      this.config.onError?.(error as Error, groupKey, 'load');
    }
  }

  /**
   * Unsubscribe from the real-time channel for a settings group.
   *
   * @description
   * Leaves the broadcasting channel and removes it from the internal
   * subscription tracking map.
   *
   * @param groupKey - The settings group key to unsubscribe from
   *
   * @example
   * ```ts
   * store.unsubscribe('theme');
   * ```
   */
  public unsubscribe(groupKey: string): void {
    const channel = this.subscriptions.get(groupKey);
    if (channel) {
      channel.leave();
      this.subscriptions.delete(groupKey);
    }
  }

  /**
   * Unsubscribe from all real-time channels.
   *
   * @description
   * Leaves all active broadcasting channels and clears the subscription
   * tracking map. Typically called during module destruction.
   *
   * @example
   * ```ts
   * store.unsubscribeAll();
   * ```
   */
  public unsubscribeAll(): void {
    for (const [, channel] of this.subscriptions) {
      channel.leave();
    }
    this.subscriptions.clear();
  }

  /**
   * Register a callback for settings changes on a specific group.
   *
   * @description
   * The callback is invoked whenever a `SettingsChanged` event is received
   * on the group's broadcasting channel. Returns an unsubscribe function
   * to remove the callback.
   *
   * @param groupKey - The settings group key to listen for changes on
   * @param callback - Handler invoked with the change payload
   * @returns A function that removes the callback when called
   *
   * @example
   * ```ts
   * const unsub = store.onChange('theme', (payload) => {
   *   console.log('Changed fields:', payload.changedFields);
   * });
   *
   * // Later
   * unsub();
   * ```
   */
  public onChange(groupKey: string, callback: ChangeCallback): () => void {
    if (!this.changeCallbacks.has(groupKey)) {
      this.changeCallbacks.set(groupKey, new Set());
    }
    this.changeCallbacks.get(groupKey)!.add(callback);

    return () => {
      this.changeCallbacks.get(groupKey)?.delete(callback);
    };
  }
}

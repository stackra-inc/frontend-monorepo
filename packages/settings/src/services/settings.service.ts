/**
 * Settings Service
 *
 * High-level API for reading and writing settings.
 * Uses a synchronous Map for in-memory caching (settings must be
 * readable synchronously for React useState initializers).
 * Delegates to SettingsStoreManager for persistence.
 *
 * @module services/settings
 */

import { Injectable, Inject } from '@stackra-inc/ts-container';
import { SETTINGS_REGISTRY, SETTINGS_MANAGER } from '@/constants/tokens.constant';
import { SettingsRegistry } from '@/registries/settings-registry.service';
import { SettingsStoreManager } from './settings-manager.service';
import type {
  SettingDtoConstructor,
  ResolvedSettingGroup,
} from '@/interfaces/setting-group.interface';

@Injectable()
export class SettingsService {
  /** Synchronous in-memory cache keyed by group key */
  private readonly cache = new Map<string, Record<string, unknown>>();

  /** Change listeners, keyed by group key */
  private readonly listeners = new Map<string, Set<() => void>>();

  /** Debounce timers, keyed by group key */
  private readonly debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    @Inject(SETTINGS_REGISTRY) private readonly registry: SettingsRegistry,
    @Inject(SETTINGS_MANAGER) private readonly manager: SettingsStoreManager
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // READ
  // ═══════════════════════════════════════════════════════════════════

  /** Get current values for a settings group (DTO-based) */
  get<T>(dto: SettingDtoConstructor<T>): T {
    return this.getValues(this.resolveGroup(dto)) as T;
  }

  /** Get values by group key (no DTO needed) */
  getByKey(groupKey: string): Record<string, unknown> | undefined {
    const group = this.registry.get(groupKey);
    return group ? this.getValues(group) : undefined;
  }

  /** Get all registered groups sorted by order */
  getGroups(): ResolvedSettingGroup[] {
    return this.registry.getAll();
  }

  /** Get a specific group by key */
  getGroup(key: string): ResolvedSettingGroup | undefined {
    return this.registry.get(key);
  }

  // ═══════════════════════════════════════════════════════════════════
  // WRITE
  // ═══════════════════════════════════════════════════════════════════

  /** Update a single field (DTO-based) */
  set<T>(dto: SettingDtoConstructor<T>, key: keyof T & string, value: unknown): void {
    const group = this.resolveGroup(dto);
    const values = this.getValues(group);
    values[key] = value;
    this.cache.set(group.key, values);
    this.debouncedPersist(group.key, values);
    this.notifyListeners(group.key);
  }

  /** Update multiple fields at once (DTO-based) */
  setMany<T>(dto: SettingDtoConstructor<T>, partial: Partial<T>): void {
    const group = this.resolveGroup(dto);
    const values = this.getValues(group);
    Object.assign(values, partial);
    this.cache.set(group.key, values);
    this.debouncedPersist(group.key, values);
    this.notifyListeners(group.key);
  }

  /** Update a single field by key (no DTO needed) */
  setByKey(groupKey: string, fieldKey: string, value: unknown): void {
    const group = this.registry.get(groupKey);
    if (!group) return;
    const values = this.getValues(group);
    values[fieldKey] = value;
    this.cache.set(groupKey, values);
    this.debouncedPersist(groupKey, values);
    this.notifyListeners(groupKey);
  }

  /** Reset a group to defaults (DTO-based) */
  reset<T>(dto: SettingDtoConstructor<T>): void {
    this.resetByKey(this.resolveGroup(dto).key);
  }

  /** Reset a group to defaults by key */
  resetByKey(groupKey: string): void {
    const group = this.registry.get(groupKey);
    if (!group) return;
    const defaults = this.buildDefaults(group);
    this.cache.set(groupKey, defaults);
    this.manager.storeForGroup(groupKey).clear(groupKey);
    this.notifyListeners(groupKey);
  }

  // ═══════════════════════════════════════════════════════════════════
  // IMPORT / EXPORT / HYDRATE
  // ═══════════════════════════════════════════════════════════════════

  /** Export all settings as JSON */
  exportAll(): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const group of this.registry.getAll()) {
      result[group.key] = this.getValues(group);
    }
    return result;
  }

  /** Import settings from JSON (merges with current) */
  importAll(data: Record<string, Record<string, unknown>>): void {
    for (const [groupKey, values] of Object.entries(data)) {
      const group = this.registry.get(groupKey);
      if (!group) continue;
      const merged = { ...this.getValues(group), ...values };
      this.cache.set(groupKey, merged);
      this.debouncedPersist(groupKey, merged);
      this.notifyListeners(groupKey);
    }
  }

  /** Hydrate values into cache (from API — no persist) */
  hydrateValues(groupKey: string, values: Record<string, unknown>): void {
    const group = this.registry.get(groupKey);
    if (!group) return;
    this.cache.set(groupKey, { ...this.buildDefaults(group), ...values });
    this.notifyListeners(groupKey);
  }

  /** Hydrate multiple groups at once */
  hydrateAll(data: Record<string, Record<string, unknown>>): void {
    for (const [k, v] of Object.entries(data)) this.hydrateValues(k, v);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════════

  /** Subscribe to changes. Returns unsubscribe function. */
  subscribe(groupKey: string, callback: () => void): () => void {
    if (!this.listeners.has(groupKey)) this.listeners.set(groupKey, new Set());
    this.listeners.get(groupKey)!.add(callback);
    return () => {
      this.listeners.get(groupKey)?.delete(callback);
    };
  }

  /** Get the store manager */
  getManager(): SettingsStoreManager {
    return this.manager;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PRIVATE
  // ═══════════════════════════════════════════════════════════════════

  private resolveGroup<T>(dto: SettingDtoConstructor<T>): ResolvedSettingGroup {
    const group = this.registry.findByDto(dto);
    if (!group) {
      throw new Error(
        `[SettingsService] "${dto.name}" not registered. Call SettingsModule.forFeature().`
      );
    }
    return group;
  }

  /**
   * Get values — synchronous. Checks Map cache first, loads from
   * persistence store on miss. Async stores (API) return defaults
   * immediately and hydrate later.
   */
  private getValues(group: ResolvedSettingGroup): Record<string, unknown> {
    /** Return from sync cache if available */
    if (this.cache.has(group.key)) {
      return { ...this.cache.get(group.key)! };
    }

    /** Cache miss — load from persistence store */
    const defaults = this.buildDefaults(group);
    const store = this.manager.storeForGroup(group.key);
    const persisted = store.load(group.key);

    if (persisted instanceof Promise) {
      /** Async store — return defaults now, hydrate when ready */
      this.cache.set(group.key, defaults);
      persisted.then((values) => {
        const merged = { ...defaults, ...values };
        this.cache.set(group.key, merged);
        this.notifyListeners(group.key);
      });
      return { ...defaults };
    }

    /** Sync store — merge and cache immediately */
    const merged = { ...defaults, ...persisted };
    this.cache.set(group.key, merged);
    return { ...merged };
  }

  private buildDefaults(group: ResolvedSettingGroup): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    for (const field of group.fields) defaults[field.key] = field.defaultValue;
    return defaults;
  }

  /** Debounced persist to store */
  private debouncedPersist(groupKey: string, values: Record<string, unknown>): void {
    const existing = this.debounceTimers.get(groupKey);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      this.manager.storeForGroup(groupKey).save(groupKey, values);
      this.debounceTimers.delete(groupKey);
    }, 300);
    this.debounceTimers.set(groupKey, timer);
  }

  private notifyListeners(groupKey: string): void {
    const cbs = this.listeners.get(groupKey);
    if (!cbs) return;
    for (const cb of cbs) {
      try {
        cb();
      } catch {
        /* don't break others */
      }
    }
  }
}

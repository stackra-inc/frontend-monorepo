/**
 * @file has-events.concern.ts
 * @description Mixin/concern that provides lifecycle event emission and observer
 * registration for Model instances.
 *
 * Maps Eloquent-style lifecycle events to RxDB collection hooks:
 * - `creating` → `preInsert`
 * - `created` → `postInsert`
 * - `updating` → `preSave`
 * - `updated` → `postSave`
 * - `deleting` → `preRemove`
 * - `deleted` → `postRemove`
 *
 * Additionally supports `restoring` and `restored` events for soft-deleted models.
 *
 * Reads `@BeforeCreate()`, `@AfterCreate()`, `@BeforeUpdate()`, `@AfterUpdate()`,
 * `@BeforeDelete()`, `@AfterDelete()` metadata from MetadataStorage. Also reads
 * `@ObservedBy()` metadata to register Observer classes.
 *
 * Pre-hooks (`creating`, `updating`, `deleting`, `restoring`) can cancel the
 * operation by returning `false`.
 *
 * @example
 * ```ts
 * @ObservedBy(UserObserver)
 * class User extends HasEvents(BaseClass) {
 *   @BeforeCreate()
 *   generateId(): void {
 *     if (!this.getAttribute('id')) {
 *       this.setAttribute('id', crypto.randomUUID());
 *     }
 *   }
 *
 *   @AfterCreate()
 *   logCreation(): void {
 *     console.log('User created!');
 *   }
 * }
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';
import type { Observer } from '@/model/observer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Supported lifecycle event names.
 *
 * Pre-events (`creating`, `updating`, `deleting`, `restoring`) can cancel
 * the operation by returning `false`. Post-events are informational only.
 */
export type LifecycleEvent =
  | 'creating'
  | 'created'
  | 'updating'
  | 'updated'
  | 'deleting'
  | 'deleted'
  | 'restoring'
  | 'restored';

/**
 * Mapping from Eloquent lifecycle events to RxDB hook names.
 *
 * Used when wiring up Model lifecycle events to RxDB collection hooks.
 */
export const EVENT_TO_RXDB_HOOK: Record<string, string> = {
  creating: 'preInsert',
  created: 'postInsert',
  updating: 'preSave',
  updated: 'postSave',
  deleting: 'preRemove',
  deleted: 'postRemove',
};

/**
 * Mapping from MetadataStorage hook event names to lifecycle event names.
 */
const HOOK_EVENT_MAP: Record<string, LifecycleEvent> = {
  beforeCreate: 'creating',
  afterCreate: 'created',
  beforeUpdate: 'updating',
  afterUpdate: 'updated',
  beforeDelete: 'deleting',
  afterDelete: 'deleted',
};

/**
 * A hook callback function.
 *
 * @param model - The Model instance the event is firing on.
 * @returns `false` to cancel (for pre-events), or `void`/`true` to proceed.
 */
export type HookCallback = (model: any) => boolean | void;

/**
 * Interface for the HasEvents concern.
 *
 * Defines the contract for lifecycle event management on Model instances.
 */
export interface HasEventsInterface {
  /** Fire a lifecycle event, returning false if cancelled by a pre-hook. */
  fireEvent(event: LifecycleEvent, model?: any): boolean;
  /** Register a hook callback for a lifecycle event. */
  registerHook(event: LifecycleEvent, callback: HookCallback): void;
}

// ---------------------------------------------------------------------------
// HasEvents Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds lifecycle event emission and observer registration
 * to a base class.
 *
 * Provides `fireEvent` and `registerHook` methods. Reads hook metadata from
 * MetadataStorage (`@BeforeCreate`, `@AfterCreate`, etc.) and observer metadata
 * (`@ObservedBy`) to build the complete set of lifecycle callbacks.
 *
 * Pre-event hooks can cancel the operation by returning `false`. If any
 * pre-hook returns `false`, `fireEvent` returns `false` and the operation
 * should be aborted.
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with HasEvents functionality.
 *
 * @example
 * ```ts
 * class Post extends HasEvents(BaseClass) {
 *   @BeforeCreate()
 *   validate(): boolean | void {
 *     if (!this.getAttribute('title')) return false;
 *   }
 * }
 *
 * const post = new Post();
 * const canProceed = post.fireEvent('creating');
 * // false if validate() returned false
 * ```
 */
export function HasEvents<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class HasEventsMixin extends Base implements HasEventsInterface {
    /**
     * Registered hook callbacks, keyed by event name.
     * @internal
     */
    _hooks: Map<LifecycleEvent, HookCallback[]> = new Map();

    /**
     * Whether metadata-based hooks have been loaded for this instance.
     * @internal
     */
    _hooksInitialized: boolean = false;

    /**
     * Cached observer instances.
     * @internal
     */
    _observers: Observer[] | null = null;

    /**
     * Fire a lifecycle event on this model.
     *
     * Executes all registered hooks and observer methods for the given event.
     * For pre-events (`creating`, `updating`, `deleting`, `restoring`), if any
     * callback returns `false`, the event is cancelled and this method returns `false`.
     *
     * @param event - The lifecycle event name to fire.
     * @param model - The model instance to pass to callbacks. Defaults to `this`.
     * @returns `false` if the event was cancelled by a pre-hook, `true` otherwise.
     *
     * @example
     * ```ts
     * // Fire a pre-event (can be cancelled):
     * if (!model.fireEvent('creating')) {
     *   return; // Operation cancelled
     * }
     *
     * // Fire a post-event (informational):
     * model.fireEvent('created');
     * ```
     */
    fireEvent(event: LifecycleEvent, model?: any): boolean {
      this._ensureHooksInitialized();

      const target = model ?? this;
      const isPreEvent =
        event === 'creating' ||
        event === 'updating' ||
        event === 'deleting' ||
        event === 'restoring';

      // 1. Run registered hook callbacks
      const callbacks = this._hooks.get(event) ?? [];
      for (const callback of callbacks) {
        const result = callback(target);
        if (isPreEvent && result === false) {
          return false;
        }
      }

      // 2. Run observer methods
      const observers = this._getObservers();
      for (const observer of observers) {
        const method = (observer as any)[event];
        if (typeof method === 'function') {
          const result = method.call(observer, target);
          if (isPreEvent && result === false) {
            return false;
          }
        }
      }

      // 3. Run decorated hook methods on the model itself
      const storage = MetadataStorage.getInstance();
      const hooksMeta = storage.getMergedHooks(this.constructor);

      for (const hookMeta of hooksMeta) {
        const mappedEvent = HOOK_EVENT_MAP[hookMeta.event];
        if (mappedEvent === event) {
          const method = (this as any)[hookMeta.methodName];
          if (typeof method === 'function') {
            const result = method.call(this);
            if (isPreEvent && result === false) {
              return false;
            }
          }
        }
      }

      return true;
    }

    /**
     * Register a hook callback for a lifecycle event.
     *
     * The callback will be invoked whenever the specified event fires.
     * For pre-events, the callback can return `false` to cancel the operation.
     *
     * @param event    - The lifecycle event to listen to.
     * @param callback - The callback function to register.
     *
     * @example
     * ```ts
     * model.registerHook('creating', (m) => {
     *   if (!m.getAttribute('name')) return false;
     * });
     *
     * model.registerHook('created', (m) => {
     *   console.log('Created:', m.getAttribute('id'));
     * });
     * ```
     */
    registerHook(event: LifecycleEvent, callback: HookCallback): void {
      this._ensureHooksInitialized();

      if (!this._hooks.has(event)) {
        this._hooks.set(event, []);
      }
      this._hooks.get(event)!.push(callback);
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Ensure that metadata-based hooks have been loaded.
     *
     * This is a no-op after the first call. The actual hook metadata is
     * read lazily in `fireEvent` to avoid issues with initialization order.
     *
     * @internal
     */
    _ensureHooksInitialized(): void {
      if (this._hooksInitialized) {
        return;
      }
      this._hooksInitialized = true;

      // Initialize the hooks map with empty arrays for all events
      const events: LifecycleEvent[] = [
        'creating',
        'created',
        'updating',
        'updated',
        'deleting',
        'deleted',
        'restoring',
        'restored',
      ];
      for (const event of events) {
        if (!this._hooks.has(event)) {
          this._hooks.set(event, []);
        }
      }
    }

    /**
     * Get or create observer instances from `@ObservedBy()` metadata.
     *
     * Reads the observer classes from MetadataStorage and instantiates
     * each one. Instances are cached for the lifetime of this model instance.
     *
     * @returns An array of Observer instances.
     * @internal
     */
    _getObservers(): Observer[] {
      if (this._observers !== null) {
        return this._observers;
      }

      const storage = MetadataStorage.getInstance();
      const classMeta = storage.getMergedClassMetadata(this.constructor);
      this._observers = classMeta.observers.map((ObserverClass) => new ObserverClass());

      return this._observers;
    }
  };
}

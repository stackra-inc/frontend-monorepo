/**
 * @file model.ts
 * @description Base Model class for the rxdb-eloquent package. This is the core
 * abstraction that wraps RxDB documents behind a Laravel Eloquent-style API.
 *
 * The Model class:
 * - Extends a composed mixin chain: HasAttributes → GuardsAttributes →
 *   HidesAttributes → HasTimestamps → SoftDeletes → HasGlobalScopes → HasEvents
 * - Provides static configuration with decorator fallbacks: collection, connection,
 *   primaryKey, timestamps, CREATED_AT, UPDATED_AT, fillable, guarded, hidden,
 *   visible, casts
 * - Configuration resolution: reads MetadataStorage first, falls back to static properties
 * - Static finders: find(id), create(attributes), all(), query(), with(...relations)
 * - Instance methods: save(), delete(), toJSON()
 * - Reactivity: $ observable property (wraps RxDocument.$)
 * - Exposes underlying RxDocument via rxDocument property (escape hatch)
 * - Boot mechanism: reads MetadataStorage for hooks, observers, scopes; registers
 *   RxDB collection hooks
 * - ModelStatic<T> type for static-side generics
 *
 * @example
 * ```ts
 * import { Model } from 'rxdb-eloquent';
 * import { Collection, Column, PrimaryKey, Timestamps } from 'rxdb-eloquent';
 *
 * @Collection('users')
 * @Timestamps()
 * class User extends Model {
 *   @PrimaryKey()
 *   @Column({ type: 'string', maxLength: 100 })
 *   declare id: string;
 *
 *   @Column({ type: 'string', maxLength: 255 })
 *   declare name: string;
 * }
 *
 * // Static finders
 * const user = await User.find('abc');
 * const all = await User.all();
 * const created = await User.create({ id: '1', name: 'Alice' });
 *
 * // Instance methods
 * user.setAttribute('name', 'Bob');
 * await user.save();
 * await user.delete();
 * const json = user.toJSON();
 * ```
 */

import { Observable, of } from 'rxjs';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { HasAttributes } from './concerns/has-attributes.concern';
import { GuardsAttributes } from './concerns/guards-attributes.concern';
import { HidesAttributes } from './concerns/hides-attributes.concern';
import { HasTimestamps } from './concerns/has-timestamps.concern';
import { SoftDeletes } from './concerns/soft-deletes.concern';
import { HasGlobalScopes } from './concerns/has-global-scopes.concern';
import { HasEvents } from './concerns/has-events.concern';
import { HasRelationships } from './concerns/has-relationships.concern';
import { QueryBuilder } from '@/query/query.builder';
import type { ConnectionManager } from '@/connection/connection.manager';
import type { Connection } from '@/connection/connection';

// ---------------------------------------------------------------------------
// ModelStatic<T> — static-side type for generic Model subclasses
// ---------------------------------------------------------------------------

/**
 * Type representing the static (constructor) side of a Model subclass.
 *
 * Used to type `this` in static methods so that `User.find()` returns
 * `Promise<User | null>` rather than `Promise<Model | null>`.
 *
 * @typeParam T - The Model instance type.
 *
 * @example
 * ```ts
 * function findModel<T extends Model>(ctor: ModelStatic<T>, id: string): Promise<T | null> {
 *   return ctor.find(id);
 * }
 * ```
 */
export interface ModelStatic<T extends Model = Model> {
  new (attributes?: Record<string, any>): T;

  /** RxDB collection name. */
  collection: string;
  /** Named connection identifier. */
  connection: string;
  /** Primary key field name. */
  primaryKey: string;
  /** Whether timestamps are auto-managed. */
  timestamps: boolean;
  /** Created-at field name. */
  CREATED_AT: string;
  /** Updated-at field name. */
  UPDATED_AT: string;
  /** Mass-assignable fields (fallback). */
  fillable: string[];
  /** Guarded fields (fallback). */
  guarded: string[];
  /** Hidden fields for serialization (fallback). */
  hidden: string[];
  /** Visible fields for serialization (fallback). */
  visible: string[];
  /** Attribute cast map (fallback). */
  casts: Record<string, string>;

  /** Check if the ConnectionManager has been set. */
  isConnected: (() => boolean);

  // Static finders — typed via ModelStatic<T>
  find<U extends Model>(this: ModelStatic<U>, id: string): Promise<U | null>;
  create<U extends Model>(this: ModelStatic<U>, attributes: Record<string, any>): Promise<U>;
  all<U extends Model>(this: ModelStatic<U>): Promise<U[]>;
  query<U extends Model>(this: ModelStatic<U>): QueryBuilder<U>;
  with<U extends Model>(this: ModelStatic<U>, ...relations: string[]): QueryBuilder<U>;

  // Configuration resolution
  getCollectionName(): string;
  getConnectionName(): string;
}

// ---------------------------------------------------------------------------
// Mixin composition — build the concern chain
// ---------------------------------------------------------------------------

/**
 * Compose all Model concerns into a single base class via mixin chain.
 *
 * The order matters: each mixin wraps the previous, so the final class
 * has all concern methods available. The chain is:
 *
 * HasAttributes → GuardsAttributes → HidesAttributes → HasTimestamps →
 * SoftDeletes → HasGlobalScopes → HasRelationships → HasEvents
 *
 * @internal
 */
const ModelBase = HasEvents(
  HasRelationships(
    HasGlobalScopes(
      SoftDeletes(
        HasTimestamps(
          HidesAttributes(
            GuardsAttributes(
              HasAttributes(
                class BaseClass {
                  /** Placeholder constructor for the mixin chain root. */
                  constructor(..._args: any[]) {
                    // intentionally empty — mixins add their own init logic
                  }
                }
              )
            )
          )
        )
      )
    )
  )
);

// ---------------------------------------------------------------------------
// Booted models tracker
// ---------------------------------------------------------------------------

/**
 * Set of Model constructors that have already been booted.
 * Prevents double-booting when multiple instances are created.
 * @internal
 */
const bootedModels: Set<Function> = new Set();

// ---------------------------------------------------------------------------
// Model class
// ---------------------------------------------------------------------------

/**
 * Abstract base Model class providing an Eloquent-style API over RxDB.
 *
 * Subclass this to define your application's data models. Configuration
 * can be provided via decorators (`@Collection`, `@Column`, etc.) or via
 * static properties as fallbacks.
 *
 * The Model mixes in all concerns: HasAttributes, GuardsAttributes,
 * HidesAttributes, HasTimestamps, SoftDeletes, HasGlobalScopes, HasEvents.
 *
 * @example
 * ```ts
 * @Collection('posts')
 * @Timestamps()
 * class Post extends Model {
 *   @PrimaryKey()
 *   @Column({ type: 'string', maxLength: 100 })
 *   declare id: string;
 *
 *   @Fillable()
 *   @Column({ type: 'string', maxLength: 255 })
 *   declare title: string;
 *
 *   static fillable = ['title'];
 * }
 * ```
 */
export class Model extends ModelBase {
  // -------------------------------------------------------------------------
  // Static configuration — fallback when decorators are not used
  // -------------------------------------------------------------------------

  /**
   * The RxDB collection name for this model.
   * Override in subclasses or use `@Collection('name')`.
   */
  static collection: string = '';

  /**
   * The named connection to use for this model.
   * Override in subclasses or use `@Connection('name')`.
   * @default 'default'
   */
  static connection: string = 'default';

  /**
   * The primary key field name.
   * @default 'id'
   */
  static primaryKey: string = 'id';

  /**
   * Whether to auto-manage created_at / updated_at timestamps.
   * Override in subclasses or use `@Timestamps()`.
   * @default true
   */
  static timestamps: boolean = true;

  /**
   * The name of the "created at" timestamp field.
   * @default 'created_at'
   */
  static CREATED_AT: string = 'created_at';

  /**
   * The name of the "updated at" timestamp field.
   * @default 'updated_at'
   */
  static UPDATED_AT: string = 'updated_at';

  /**
   * Mass-assignable field names (fallback when `@Fillable()` decorators are not used).
   * Set to `['*']` to allow all fields.
   * @default []
   */
  static fillable: string[] = [];

  /**
   * Guarded field names (fallback when `@Guarded()` decorators are not used).
   * Set to `['*']` to guard all fields (default).
   * @default ['*']
   */
  static guarded: string[] = ['*'];

  /**
   * Fields to exclude from `toJSON()` output (fallback).
   * @default []
   */
  static hidden: string[] = [];

  /**
   * Fields to include in `toJSON()` output — whitelist mode (fallback).
   * @default []
   */
  static visible: string[] = [];

  /**
   * Attribute cast map (fallback when `@Cast()` decorators are not used).
   * Keys are attribute names, values are cast type strings.
   *
   * @example
   * ```ts
   * static casts = { age: 'integer', settings: 'json', created_at: 'date' };
   * ```
   * @default {}
   */
  static casts: Record<string, string> = {};

  // -------------------------------------------------------------------------
  // ConnectionManager integration
  // -------------------------------------------------------------------------

  /** Global ConnectionManager reference, set by EloquentModule.forRoot(). */
  private static _connectionManager: ConnectionManager | null = null;

  /** Set the global ConnectionManager. Called by EloquentModule. */
  static setConnectionManager(manager: ConnectionManager): void {
    Model._connectionManager = manager;
  }

  /**
   * Check if the ConnectionManager has been set.
   * Returns true when EloquentModule.forRoot() has been called.
   */
  static isConnected(): boolean {
    return Model._connectionManager !== null;
  }

  /** Get the ConnectionManager. Throws if not set. */
  static getConnectionManager(): ConnectionManager {
    if (!Model._connectionManager) {
      throw new Error('ConnectionManager not set. Did you call EloquentModule.forRoot()?');
    }
    return Model._connectionManager;
  }

  /** Resolve the Connection for this model's connection name. */
  static async resolveConnection(): Promise<Connection> {
    const connName = this.getConnectionName();
    const manager = Model.getConnectionManager();
    return manager.connection(connName);
  }

  /** Resolve the RxCollection for this model. */
  static async resolveCollection(): Promise<any> {
    const collName = this.getCollectionName();
    const conn = await this.resolveConnection();
    return conn.getCollection(collName);
  }

  // -------------------------------------------------------------------------
  // Instance state
  // -------------------------------------------------------------------------

  /**
   * Whether this model instance exists in the database (has been persisted).
   * Set to `true` after a successful `save()` or when hydrated from a query.
   * @internal
   */
  protected _exists: boolean = false;

  /**
   * The underlying RxDocument instance, if this model was loaded from the database.
   * `null` for new (unsaved) model instances.
   * @internal
   */
  protected _rxDocument: any = null;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new Model instance, optionally filling it with initial attributes.
   *
   * Mass assignment protection is applied: only fillable attributes are set.
   * Use `fillRaw()` internally to bypass mass assignment (e.g., when hydrating
   * from the database).
   *
   * @param attributes - Optional initial attributes to fill via mass assignment.
   *
   * @example
   * ```ts
   * const user = new User({ name: 'Alice', email: 'alice@example.com' });
   * ```
   */
  constructor(attributes?: Record<string, any>) {
    super();

    // Boot the model class if not already booted
    (this.constructor as typeof Model).bootIfNotBooted();

    // Fill initial attributes through mass assignment protection
    if (attributes) {
      const fillable = this.fillableFromArray(attributes);
      for (const [key, value] of Object.entries(fillable)) {
        this.setAttribute(key, value);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Configuration resolution — MetadataStorage first, static fallback
  // -------------------------------------------------------------------------

  /**
   * Get the RxDB collection name for this model.
   *
   * Resolution: MetadataStorage `@Collection()` → static `collection` property.
   *
   * @returns The collection name string.
   *
   * @example
   * ```ts
   * User.getCollectionName(); // 'users'
   * ```
   */
  static getCollectionName(): string {
    const storage = MetadataStorage.getInstance();
    const classMeta = storage.getMergedClassMetadata(this);
    const result = classMeta.collection ?? this.collection;
    return result;
  }

  /**
   * Get the named connection identifier for this model.
   *
   * Resolution: MetadataStorage `@Connection()` → static `connection` property.
   *
   * @returns The connection name string.
   *
   * @example
   * ```ts
   * User.getConnectionName(); // 'default'
   * ```
   */
  static getConnectionName(): string {
    const storage = MetadataStorage.getInstance();
    const classMeta = storage.getMergedClassMetadata(this);

    // 1. Explicit decorator value
    if (classMeta.connection) {
      return classMeta.connection;
    }

    // 2. Explicit static property (non-empty, non-default)
    if (this.connection && this.connection !== 'default') {
      return this.connection;
    }

    // 3. Fall back to the ConnectionManager's configured default name.
    //    The config `{ default: 'local', connections: { local: ... } }` means
    //    the default connection NAME is 'local', not 'default'.
    if (Model._connectionManager) {
      const defaultName = Model._connectionManager.getDefaultConnectionName();
      return defaultName;
    }

    // 4. Last resort — return 'default' (will fail at connection() time if
    //    no connection named 'default' exists in the config).
    return 'default';
  }

  // -------------------------------------------------------------------------
  // Boot mechanism
  // -------------------------------------------------------------------------

  /**
   * Boot the model class if it hasn't been booted yet.
   *
   * Booting reads MetadataStorage for hooks, observers, and scopes,
   * and registers them. This is called once per Model subclass, on
   * first instantiation.
   *
   * @internal
   */
  static bootIfNotBooted(): void {
    if (bootedModels.has(this)) {
      return;
    }
    bootedModels.add(this);
    this.boot();
  }

  /**
   * Boot the model class.
   *
   * Override in subclasses to add custom boot logic. Always call `super.boot()`.
   *
   * The default implementation reads MetadataStorage for:
   * - Lifecycle hooks (`@BeforeCreate`, `@AfterCreate`, etc.)
   * - Observer classes (`@ObservedBy`)
   * - Global scopes (`@GlobalScope`)
   *
   * These are registered so that `fireEvent()` and `applyGlobalScopes()`
   * work correctly at runtime.
   *
   * @example
   * ```ts
   * class User extends Model {
   *   static boot(): void {
   *     super.boot();
   *     // Custom boot logic here
   *   }
   * }
   * ```
   */
  static boot(): void {
    // Boot logic is handled lazily by the concerns (HasEvents, HasGlobalScopes)
    // when they first access MetadataStorage. This static boot() is a hook
    // point for subclasses to add custom initialization.
  }

  // -------------------------------------------------------------------------
  // Static finders
  // -------------------------------------------------------------------------

  /**
   * Find a model instance by its primary key.
   *
   * Queries the RxDB collection for a document matching the given ID.
   * Returns `null` if no document is found or if the ConnectionManager
   * is not yet configured.
   *
   * @param id - The primary key value to search for.
   * @returns A promise resolving to the found Model instance, or `null`.
   *
   * @example
   * ```ts
   * const user = await User.find('abc-123');
   * if (user) {
   *   console.log(user.getAttribute('name'));
   * }
   * ```
   */
  static async find<T extends Model>(this: ModelStatic<T>, id: string): Promise<T | null> {
    const collection = await (this as any).resolveCollection();
    const doc = await collection.findOne(id).exec();
    if (!doc) return null;
    return (this as any).hydrate(doc);
  }

  /**
   * Create a new model instance and persist it to the database.
   *
   * Applies mass assignment protection, sets timestamps, fires lifecycle
   * events, and inserts the document into the RxDB collection.
   *
   * @param attributes - The attributes for the new model.
   * @returns A promise resolving to the newly created Model instance.
   *
   * @example
   * ```ts
   * const user = await User.create({ name: 'Alice', email: 'alice@example.com' });
   * ```
   */
  static async create<T extends Model>(
    this: ModelStatic<T>,
    attributes: Record<string, any>
  ): Promise<T> {
    const instance = new this(attributes);
    await instance.save();
    return instance;
  }

  /**
   * Retrieve all model instances from the database.
   *
   * Returns all documents in the collection as Model instances.
   *
   * @returns A promise resolving to an array of all Model instances.
   *
   * @example
   * ```ts
   * const users = await User.all();
   * ```
   */
  static async all<T extends Model>(this: ModelStatic<T>): Promise<T[]> {
    return this.query().get();
  }

  /**
   * Start a new query builder for this model.
   *
   * Returns a fresh QueryBuilder instance scoped to this model's collection.
   *
   * @returns A new QueryBuilder instance.
   *
   * @example
   * ```ts
   * const adults = await User.query().where('age', '>', 18).get();
   * ```
   */
  static query<T extends Model>(this: ModelStatic<T>): QueryBuilder<T> {
    return QueryBuilder.createProxy<T>(this as any) as any;
  }

  /**
   * Start a query with eager-loaded relations.
   *
   * Shorthand for `Model.query().with(...relations)`.
   *
   * @param relations - Relation names to eager-load.
   * @returns A QueryBuilder with the specified eager loads.
   *
   * @example
   * ```ts
   * const users = await User.with('posts', 'profile').get();
   * ```
   */
  static with<T extends Model>(this: ModelStatic<T>, ...relations: string[]): QueryBuilder<T> {
    return this.query().with(...relations);
  }

  // -------------------------------------------------------------------------
  // Instance methods
  // -------------------------------------------------------------------------

  /**
   * Save the model instance to the database.
   *
   * If the model is new (`_exists === false`), performs an insert.
   * If the model already exists, performs an update via `incrementalPatch()`.
   *
   * Fires lifecycle events: `creating`/`created` for inserts,
   * `updating`/`updated` for updates. Pre-events can cancel the
   * operation by returning `false`.
   *
   * Touches timestamps if enabled. Falls back to in-memory-only save
   * when no ConnectionManager is configured.
   *
   * @returns A promise resolving to `this` for chaining.
   *
   * @example
   * ```ts
   * const user = new User({ name: 'Alice' });
   * await user.save(); // Insert
   *
   * user.setAttribute('name', 'Bob');
   * await user.save(); // Update
   * ```
   */
  async save(): Promise<this> {
    const isNew = !this._exists;
    const ctor = this.constructor as typeof Model;

    // Fire pre-event — cancel if returns false
    const preEvent = isNew ? 'creating' : 'updating';
    if (!this.fireEvent(preEvent as any)) {
      return this;
    }

    // Touch timestamps
    this.touchTimestamps(isNew);

    // Resolve collection — errors propagate (no try/catch)
    const collection = await ctor.resolveCollection();

    if (isNew) {
      // INSERT — call RxCollection.insert()
      const attrs = this.getAttributes();
      const doc = await collection.insert(attrs);
      this._rxDocument = doc;
    } else {
      // UPDATE — call RxDocument.incrementalPatch()
      if (!this._rxDocument) {
        throw new Error('Cannot update: RxDocument reference is missing. Was this model hydrated from a query?');
      }
      const dirty = this.getDirtyAttributes();
      if (Object.keys(dirty).length > 0) {
        await this._rxDocument.incrementalPatch(dirty);
      }
    }

    this._exists = true;

    // Sync original attributes for dirty tracking
    this.syncOriginal();

    // Fire post-event
    const postEvent = isNew ? 'created' : 'updated';
    this.fireEvent(postEvent as any);

    return this;
  }

  /**
   * Get attributes that have changed since the last sync.
   *
   * Compares current attributes against the original snapshot and returns
   * only the key-value pairs that differ.
   *
   * @returns A record of dirty attribute key-value pairs.
   */
  getDirtyAttributes(): Record<string, any> {
    const dirty: Record<string, any> = {};
    const current = this.getAttributes();
    const original = this.getOriginal();
    for (const key of Object.keys(current)) {
      if (current[key] !== original[key]) {
        dirty[key] = current[key];
      }
    }
    return dirty;
  }

  /**
   * Delete the model instance from the database.
   *
   * If soft deletes are enabled, sets `deleted_at` instead of removing.
   * Otherwise, permanently removes the document via `RxDocument.remove()`.
   *
   * Fires `deleting`/`deleted` lifecycle events. The `deleting` pre-event
   * can cancel the operation by returning `false`.
   *
   * @returns A promise that resolves when the delete is complete.
   *
   * @example
   * ```ts
   * await user.delete();
   * ```
   */
  async delete(): Promise<void> {
    // Fire pre-event — cancel if returns false
    if (!this.fireEvent('deleting' as any)) {
      return;
    }

    // Check if soft deletes are enabled
    const storage = MetadataStorage.getInstance();
    const classMeta = storage.getMergedClassMetadata(this.constructor);

    if (classMeta.softDeletes) {
      // Soft delete: set deleted_at and save
      await this.performSoftDelete();
    } else {
      // Hard delete: remove the RxDocument
      if (!this._rxDocument) {
        throw new Error('Cannot delete: RxDocument reference is missing. Was this model hydrated from a query?');
      }
      await this._rxDocument.remove();
      this._exists = false;
    }

    // Fire post-event
    this.fireEvent('deleted' as any);
  }

  /**
   * Serialize the model to a plain JSON object.
   *
   * Applies visibility rules: if `visible` is set, only those fields appear;
   * if `hidden` is set, those fields are excluded.
   *
   * @returns A plain object suitable for JSON serialization.
   *
   * @example
   * ```ts
   * const json = user.toJSON();
   * // { id: '1', name: 'Alice', email: 'alice@example.com' }
   * // (password excluded if in hidden)
   * ```
   */
  toJSON(): Record<string, any> {
    const attributes = this.getAttributes();
    return this.applyVisibility(attributes);
  }

  // -------------------------------------------------------------------------
  // Reactivity
  // -------------------------------------------------------------------------

  /**
   * Observable that emits whenever the underlying RxDocument changes.
   *
   * Wraps `RxDocument.$` to provide reactive updates. Re-syncs the model's
   * attributes from the RxDocument data on each emission. If no RxDocument
   * is attached (new unsaved model), returns an Observable that emits
   * the current state once.
   *
   * @returns An RxJS Observable emitting this Model instance on changes.
   *
   * @example
   * ```ts
   * user.$.subscribe(updatedUser => {
   *   console.log('User changed:', updatedUser.getAttribute('name'));
   * });
   * ```
   */
  get $(): Observable<this> {
    if (this._rxDocument && this._rxDocument.$) {
      // Wrap the RxDocument observable to emit Model instances
      return new Observable<this>((subscriber) => {
        const sub = this._rxDocument.$.subscribe({
          next: (rxDoc: any) => {
            // Re-sync attributes from the updated RxDocument
            const data = typeof rxDoc.toJSON === 'function' ? rxDoc.toJSON() : { ...rxDoc };
            this.fillRaw(data);
            subscriber.next(this);
          },
          error: (err: any) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
        return () => sub.unsubscribe();
      });
    }

    // No RxDocument attached — emit current state once
    return of(this);
  }

  // -------------------------------------------------------------------------
  // RxDocument escape hatch
  // -------------------------------------------------------------------------

  /**
   * Access the underlying RxDocument instance directly.
   *
   * This is an escape hatch for advanced use cases where you need to
   * interact with RxDB APIs that are not exposed by the Model layer.
   *
   * Returns `null` for new (unsaved) model instances.
   *
   * @returns The underlying RxDocument, or `null`.
   *
   * @example
   * ```ts
   * const rxDoc = user.rxDocument;
   * if (rxDoc) {
   *   await rxDoc.update({ $set: { name: 'Bob' } });
   * }
   * ```
   */
  get rxDocument(): any {
    return this._rxDocument;
  }

  // -------------------------------------------------------------------------
  // Hydration (internal)
  // -------------------------------------------------------------------------

  /**
   * Create a Model instance from an RxDocument (database result).
   *
   * Sets the internal attributes from the document data, marks the
   * instance as existing, and attaches the RxDocument reference.
   *
   * @param doc - The RxDocument to hydrate from.
   * @returns A new Model instance populated with the document's data.
   *
   * @internal
   */
  static hydrate<T extends Model>(this: ModelStatic<T>, doc: any): T {
    const instance = new this();

    // Extract plain data from the RxDocument
    const data = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };

    // Fill attributes directly (bypass mass assignment)
    instance.fillRaw(data);
    instance.syncOriginal();

    // Mark as existing and attach the RxDocument
    (instance as any)._exists = true;
    (instance as any)._rxDocument = doc;

    return instance;
  }
}

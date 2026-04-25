/**
 * @file metadata.storage.ts
 * @description Central singleton registry for all decorator metadata in the rxdb-eloquent package.
 *
 * MetadataStorage collects metadata registered by TypeScript decorators at class definition time.
 * It follows the TypeORM MetadataStorage pattern — a single global instance keyed by class
 * constructor functions. The SchemaResolver, Model base class, QueryBuilder, and other
 * components read from this registry to resolve configuration without relying on static properties.
 *
 * All maps are keyed by the class constructor (`Function`) so that each Model class has its
 * own isolated metadata bucket. Inheritance is supported via `getMerged*` methods that walk
 * the prototype chain and merge parent metadata with child metadata (child takes precedence).
 */

// ---------------------------------------------------------------------------
// Metadata Interfaces
// ---------------------------------------------------------------------------

/**
 * Options for a schema column definition.
 *
 * Passed to the `@Column()` decorator to describe the JSON Schema type and constraints
 * for a single property on a Model class.
 *
 * @example
 * ```ts
 * @Column({ type: 'string', maxLength: 255 })
 * declare name: string;
 * ```
 */
export interface ColumnOptions {
  /** The JSON Schema type of the column. */
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object' | 'enum';

  /** Maximum string length (for `type: 'string'`). */
  maxLength?: number;

  /** Minimum numeric value (for `type: 'integer'` or `type: 'number'`). */
  minimum?: number;

  /** Maximum numeric value (for `type: 'integer'` or `type: 'number'`). */
  maximum?: number;

  /** Numeric multiple-of constraint (for `type: 'integer'` or `type: 'number'`). */
  multipleOf?: number;

  /** Allowed values (for `type: 'enum'`). */
  enumValues?: any[];

  /** Item schema (for `type: 'array'`). */
  items?: object;

  /** JSON Schema format string, e.g. `'date-time'`. */
  format?: string;

  /** Whether this column is required in the schema. Defaults to `true`. */
  required?: boolean;
}

/**
 * Metadata for a single column on a Model class.
 *
 * Accumulated by `@Column()` and various flag decorators (`@PrimaryKey`, `@Fillable`, etc.).
 * Each column is identified by its `propertyKey` (the class property name).
 */
export interface ColumnMetadata {
  /** The property name on the Model class. */
  propertyKey: string;

  /** Column type and constraint options from `@Column()`. */
  options: ColumnOptions;

  /** Whether this column is the primary key (`@PrimaryKey()`). */
  isPrimary: boolean;

  /** Whether this column is mass-assignable (`@Fillable()`). */
  isFillable: boolean;

  /** Whether this column is guarded from mass assignment (`@Guarded()`). */
  isGuarded: boolean;

  /** Whether this column is excluded from `toJSON()` (`@Hidden()`). */
  isHidden: boolean;

  /** Whether this column is included in `toJSON()` whitelist (`@Visible()`). */
  isVisible: boolean;

  /** Whether this column has a database index (`@Index()`). */
  isIndex: boolean;

  /** Whether this column is immutable after creation (`@Final()`). */
  isFinal: boolean;

  /** Default value for this column (`@Default(value)`). */
  defaultValue?: any;

  /** RxDB ref collection name for population (`@Ref('collectionName')`). */
  ref?: string;

  /** Attribute cast type (`@Cast('type')`). */
  castType?: string;
}

/**
 * Metadata for a relation between two Model classes.
 *
 * Registered by `@HasOne`, `@HasMany`, `@BelongsTo`, and `@BelongsToMany` decorators.
 * Uses a factory function for the related Model to avoid circular dependency issues.
 *
 * @example
 * ```ts
 * @HasMany(() => Post, 'author_id')
 * declare posts: Post[];
 * ```
 */
export interface RelationMetadata {
  /** The property name on the Model class. */
  propertyKey: string;

  /** The type of relation. */
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';

  /** Factory function that returns the related Model class (deferred to avoid circular deps). */
  relatedFactory: () => any;

  /** The foreign key column on the related (or pivot) collection. */
  foreignKey: string;

  /** The local key on this Model (defaults to primary key). */
  localKey?: string;

  /** The owner key on the parent Model (for belongsTo). */
  ownerKey?: string;

  /** The pivot collection name (for belongsToMany). */
  pivotCollection?: string;

  /** The foreign pivot key (for belongsToMany). */
  foreignPivotKey?: string;

  /** The related pivot key (for belongsToMany). */
  relatedPivotKey?: string;
}

/**
 * Metadata for a query scope method.
 *
 * Registered by `@Scope()` (local) or `@GlobalScope('name')` (global) decorators.
 */
export interface ScopeMetadata {
  /** The method name on the Model class. */
  methodName: string;

  /** Whether this is a local or global scope. */
  type: 'local' | 'global';

  /** The name used to identify global scopes (for removal via `withoutGlobalScope`). */
  name?: string;
}

/**
 * Metadata for a lifecycle hook method.
 *
 * Registered by `@BeforeCreate`, `@AfterCreate`, `@BeforeUpdate`, `@AfterUpdate`,
 * `@BeforeDelete`, and `@AfterDelete` decorators.
 */
export interface HookMetadata {
  /** The method name on the Model class. */
  methodName: string;

  /** The lifecycle event this hook listens to. */
  event:
    | 'beforeCreate'
    | 'afterCreate'
    | 'beforeUpdate'
    | 'afterUpdate'
    | 'beforeDelete'
    | 'afterDelete';
}

/**
 * Metadata for an accessor or mutator method.
 *
 * Registered by `@Accessor('fieldName')` or `@Mutator('fieldName')` decorators.
 */
export interface AccessorMutatorMetadata {
  /** The method name on the Model class. */
  methodName: string;

  /** The attribute field name this accessor/mutator transforms. */
  fieldName: string;

  /** Whether this is a getter accessor or a setter mutator. */
  type: 'accessor' | 'mutator';
}

/**
 * Class-level metadata for a Model.
 *
 * Accumulated by class decorators: `@Collection`, `@Connection`, `@Timestamps`,
 * `@SoftDeletes`, and `@ObservedBy`.
 */
export interface ClassMetadata {
  /** The RxDB collection name (`@Collection('name')`). */
  collection?: string;

  /** The named connection to use (`@Connection('name')`). */
  connection?: string;

  /** Whether the Model auto-manages `created_at` / `updated_at` (`@Timestamps()`). */
  timestamps: boolean;

  /** Whether the Model uses soft deletion with `deleted_at` (`@SoftDeletes()`). */
  softDeletes: boolean;

  /** Observer classes registered via `@ObservedBy(ObserverClass)`. */
  observers: (new (...args: any[]) => any)[];
}

// ---------------------------------------------------------------------------
// MetadataStorage Singleton
// ---------------------------------------------------------------------------

/**
 * Central singleton registry that collects ALL decorator metadata at class definition time.
 *
 * Decorators call the `register*` methods to store metadata. The Model base class,
 * SchemaResolver, QueryBuilder, and other consumers call the `get*` / `getMerged*`
 * methods to read it back.
 *
 * All internal maps are keyed by the class constructor (`Function`). This means each
 * Model class has its own isolated metadata bucket. Inheritance is handled explicitly
 * by the `getMerged*` family of methods which walk the prototype chain.
 *
 * @example
 * ```ts
 * const storage = MetadataStorage.getInstance();
 * storage.registerColumn(User, 'name', { type: 'string', maxLength: 255 });
 * const columns = storage.getColumns(User); // Map { 'name' => ColumnMetadata }
 * ```
 */
export class MetadataStorage {
  // -------------------------------------------------------------------------
  // Singleton
  // -------------------------------------------------------------------------

  /** The single shared instance. */
  private static instance: MetadataStorage;

  /**
   * Returns the singleton MetadataStorage instance.
   * Creates it on first access.
   *
   * @returns The global MetadataStorage instance.
   *
   * @example
   * ```ts
   * const storage = MetadataStorage.getInstance();
   * ```
   */
  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  // -------------------------------------------------------------------------
  // Private Maps — keyed by class constructor (Function)
  // -------------------------------------------------------------------------

  /** Class-level metadata (collection name, connection, timestamps, softDeletes, observers). */
  private classMetadata: Map<Function, ClassMetadata> = new Map();

  /** Column metadata per class, inner map keyed by property name. */
  private columnMetadata: Map<Function, Map<string, ColumnMetadata>> = new Map();

  /** Relation metadata per class, inner map keyed by property name. */
  private relationMetadata: Map<Function, Map<string, RelationMetadata>> = new Map();

  /** Scope metadata per class, inner map keyed by method name. */
  private scopeMetadata: Map<Function, Map<string, ScopeMetadata>> = new Map();

  /** Hook metadata per class (array — multiple hooks can listen to the same event). */
  private hookMetadata: Map<Function, HookMetadata[]> = new Map();

  /** Accessor/mutator metadata per class (array — multiple accessors/mutators possible). */
  private accessorMutatorMetadata: Map<Function, AccessorMutatorMetadata[]> = new Map();

  // -------------------------------------------------------------------------
  // Registration Methods — called by decorators
  // -------------------------------------------------------------------------

  /**
   * Register or update a single key on the class-level metadata for a Model.
   *
   * Called by class decorators like `@Collection`, `@Connection`, `@Timestamps`,
   * `@SoftDeletes`, and `@ObservedBy`.
   *
   * @param target - The Model class constructor.
   * @param key    - The ClassMetadata key to set.
   * @param value  - The value to assign.
   *
   * @example
   * ```ts
   * // Inside @Collection('users') decorator:
   * storage.registerClassMetadata(User, 'collection', 'users');
   * ```
   */
  registerClassMetadata(target: Function, key: keyof ClassMetadata, value: any): void {
    const existing = this.classMetadata.get(target) ?? this.createDefaultClassMetadata();
    // Use bracket notation so we can set any key dynamically
    (existing as any)[key] = value;
    this.classMetadata.set(target, existing);
  }

  /**
   * Register a column definition for a property on a Model class.
   *
   * Called by the `@Column()` decorator. Creates the ColumnMetadata entry with
   * default flag values; subsequent flag decorators update it via `registerColumnFlag`.
   *
   * @param target      - The Model class constructor.
   * @param propertyKey - The property name.
   * @param options     - Column type and constraint options.
   *
   * @example
   * ```ts
   * // Inside @Column({ type: 'string', maxLength: 255 }) decorator:
   * storage.registerColumn(User, 'name', { type: 'string', maxLength: 255 });
   * ```
   */
  registerColumn(target: Function, propertyKey: string, options: ColumnOptions): void {
    if (!this.columnMetadata.has(target)) {
      this.columnMetadata.set(target, new Map());
    }

    const columns = this.columnMetadata.get(target)!;
    // Preserve any flags that were already set by decorators that ran before @Column
    const existing = columns.get(propertyKey);

    const metadata: ColumnMetadata = {
      propertyKey,
      options,
      isPrimary: existing?.isPrimary ?? false,
      isFillable: existing?.isFillable ?? false,
      isGuarded: existing?.isGuarded ?? false,
      isHidden: existing?.isHidden ?? false,
      isVisible: existing?.isVisible ?? false,
      isIndex: existing?.isIndex ?? false,
      isFinal: existing?.isFinal ?? false,
      defaultValue: existing?.defaultValue,
      ref: existing?.ref,
      castType: existing?.castType,
    };

    columns.set(propertyKey, metadata);
  }

  /**
   * Register a flag or value on an existing (or new) column entry.
   *
   * Called by property decorators that modify column flags: `@PrimaryKey`, `@Fillable`,
   * `@Guarded`, `@Hidden`, `@Visible`, `@Index`, `@Final`, `@Cast`, `@Default`, `@Ref`.
   *
   * If the column entry does not yet exist (the flag decorator ran before `@Column`),
   * a placeholder entry is created so the flag is not lost.
   *
   * @param target      - The Model class constructor.
   * @param propertyKey - The property name.
   * @param flag        - The ColumnMetadata key to set (e.g. `'isPrimary'`, `'castType'`).
   * @param value       - The value to assign to the flag.
   *
   * @example
   * ```ts
   * // Inside @PrimaryKey() decorator:
   * storage.registerColumnFlag(User, 'id', 'isPrimary', true);
   *
   * // Inside @Cast('date') decorator:
   * storage.registerColumnFlag(User, 'createdAt', 'castType', 'date');
   *
   * // Inside @Default('active') decorator:
   * storage.registerColumnFlag(User, 'status', 'defaultValue', 'active');
   * ```
   */
  registerColumnFlag(target: Function, propertyKey: string, flag: string, value: any): void {
    if (!this.columnMetadata.has(target)) {
      this.columnMetadata.set(target, new Map());
    }

    const columns = this.columnMetadata.get(target)!;

    // Ensure a column entry exists — create a placeholder if @Column hasn't run yet
    if (!columns.has(propertyKey)) {
      columns.set(propertyKey, this.createDefaultColumnMetadata(propertyKey));
    }

    const col = columns.get(propertyKey)!;
    (col as any)[flag] = value;
  }

  /**
   * Register a relation for a property on a Model class.
   *
   * Called by `@HasOne`, `@HasMany`, `@BelongsTo`, and `@BelongsToMany` decorators.
   *
   * @param target   - The Model class constructor.
   * @param metadata - The full relation metadata object.
   *
   * @example
   * ```ts
   * storage.registerRelation(User, {
   *   propertyKey: 'posts',
   *   type: 'hasMany',
   *   relatedFactory: () => Post,
   *   foreignKey: 'author_id',
   * });
   * ```
   */
  registerRelation(target: Function, metadata: RelationMetadata): void {
    if (!this.relationMetadata.has(target)) {
      this.relationMetadata.set(target, new Map());
    }
    this.relationMetadata.get(target)!.set(metadata.propertyKey, metadata);
  }

  /**
   * Register a scope for a method on a Model class.
   *
   * Called by `@Scope()` and `@GlobalScope('name')` decorators.
   *
   * @param target   - The Model class constructor.
   * @param metadata - The scope metadata object.
   *
   * @example
   * ```ts
   * storage.registerScope(User, {
   *   methodName: 'scopeActive',
   *   type: 'local',
   * });
   * ```
   */
  registerScope(target: Function, metadata: ScopeMetadata): void {
    if (!this.scopeMetadata.has(target)) {
      this.scopeMetadata.set(target, new Map());
    }
    this.scopeMetadata.get(target)!.set(metadata.methodName, metadata);
  }

  /**
   * Register a lifecycle hook for a method on a Model class.
   *
   * Called by `@BeforeCreate`, `@AfterCreate`, `@BeforeUpdate`, `@AfterUpdate`,
   * `@BeforeDelete`, and `@AfterDelete` decorators.
   *
   * @param target   - The Model class constructor.
   * @param metadata - The hook metadata object.
   *
   * @example
   * ```ts
   * storage.registerHook(User, {
   *   methodName: 'generateId',
   *   event: 'beforeCreate',
   * });
   * ```
   */
  registerHook(target: Function, metadata: HookMetadata): void {
    if (!this.hookMetadata.has(target)) {
      this.hookMetadata.set(target, []);
    }
    this.hookMetadata.get(target)!.push(metadata);
  }

  /**
   * Register an accessor or mutator for a method on a Model class.
   *
   * Called by `@Accessor('fieldName')` and `@Mutator('fieldName')` decorators.
   *
   * @param target   - The Model class constructor.
   * @param metadata - The accessor/mutator metadata object.
   *
   * @example
   * ```ts
   * storage.registerAccessorMutator(User, {
   *   methodName: 'getFullName',
   *   fieldName: 'fullName',
   *   type: 'accessor',
   * });
   * ```
   */
  registerAccessorMutator(target: Function, metadata: AccessorMutatorMetadata): void {
    if (!this.accessorMutatorMetadata.has(target)) {
      this.accessorMutatorMetadata.set(target, []);
    }
    this.accessorMutatorMetadata.get(target)!.push(metadata);
  }

  // -------------------------------------------------------------------------
  // Retrieval Methods — called by Model, SchemaResolver, QueryBuilder
  // -------------------------------------------------------------------------

  /**
   * Get the class-level metadata for a Model (own metadata only, no inheritance).
   *
   * @param target - The Model class constructor.
   * @returns The ClassMetadata, or a default if none was registered.
   */
  getClassMetadata(target: Function): ClassMetadata {
    return this.classMetadata.get(target) ?? this.createDefaultClassMetadata();
  }

  /**
   * Get all column metadata for a Model (own columns only, no inheritance).
   *
   * @param target - The Model class constructor.
   * @returns A map of property name → ColumnMetadata.
   */
  getColumns(target: Function): Map<string, ColumnMetadata> {
    return this.columnMetadata.get(target) ?? new Map();
  }

  /**
   * Get all relation metadata for a Model (own relations only, no inheritance).
   *
   * @param target - The Model class constructor.
   * @returns A map of property name → RelationMetadata.
   */
  getRelations(target: Function): Map<string, RelationMetadata> {
    return this.relationMetadata.get(target) ?? new Map();
  }

  /**
   * Get all scope metadata for a Model (own scopes only, no inheritance).
   *
   * @param target - The Model class constructor.
   * @returns A map of method name → ScopeMetadata.
   */
  getScopes(target: Function): Map<string, ScopeMetadata> {
    return this.scopeMetadata.get(target) ?? new Map();
  }

  /**
   * Get all hook metadata for a Model (own hooks only, no inheritance).
   *
   * @param target - The Model class constructor.
   * @returns An array of HookMetadata entries.
   */
  getHooks(target: Function): HookMetadata[] {
    return this.hookMetadata.get(target) ?? [];
  }

  /**
   * Get all accessor/mutator metadata for a Model (own only, no inheritance).
   *
   * @param target - The Model class constructor.
   * @returns An array of AccessorMutatorMetadata entries.
   */
  getAccessorsMutators(target: Function): AccessorMutatorMetadata[] {
    return this.accessorMutatorMetadata.get(target) ?? [];
  }

  /**
   * Get the set of fillable field names for a Model (own columns only).
   *
   * @param target - The Model class constructor.
   * @returns A Set of property names marked with `@Fillable()`.
   */
  getFillableFields(target: Function): Set<string> {
    const result = new Set<string>();
    const columns = this.getColumns(target);
    for (const [key, col] of columns) {
      if (col.isFillable) {
        result.add(key);
      }
    }
    return result;
  }

  /**
   * Get the set of guarded field names for a Model (own columns only).
   *
   * @param target - The Model class constructor.
   * @returns A Set of property names marked with `@Guarded()`.
   */
  getGuardedFields(target: Function): Set<string> {
    const result = new Set<string>();
    const columns = this.getColumns(target);
    for (const [key, col] of columns) {
      if (col.isGuarded) {
        result.add(key);
      }
    }
    return result;
  }

  /**
   * Get the set of hidden field names for a Model (own columns only).
   *
   * @param target - The Model class constructor.
   * @returns A Set of property names marked with `@Hidden()`.
   */
  getHiddenFields(target: Function): Set<string> {
    const result = new Set<string>();
    const columns = this.getColumns(target);
    for (const [key, col] of columns) {
      if (col.isHidden) {
        result.add(key);
      }
    }
    return result;
  }

  /**
   * Get the set of visible field names for a Model (own columns only).
   *
   * @param target - The Model class constructor.
   * @returns A Set of property names marked with `@Visible()`.
   */
  getVisibleFields(target: Function): Set<string> {
    const result = new Set<string>();
    const columns = this.getColumns(target);
    for (const [key, col] of columns) {
      if (col.isVisible) {
        result.add(key);
      }
    }
    return result;
  }

  /**
   * Get the cast map for a Model (own columns only).
   *
   * @param target - The Model class constructor.
   * @returns A Map of property name → cast type string.
   */
  getCasts(target: Function): Map<string, string> {
    const result = new Map<string, string>();
    const columns = this.getColumns(target);
    for (const [key, col] of columns) {
      if (col.castType !== undefined) {
        result.set(key, col.castType);
      }
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Inheritance Support — walk prototype chain, merge parent + child
  // -------------------------------------------------------------------------

  /**
   * Get merged column metadata for a Model, including inherited columns from parent classes.
   *
   * Walks the prototype chain from the target up to (but not including) the base
   * `Object` or `Function.prototype`. Parent columns are collected first, then child
   * columns are overlaid on top — child definitions override parent definitions for
   * the same property key.
   *
   * @param target - The Model class constructor.
   * @returns A merged Map of property name → ColumnMetadata.
   *
   * @example
   * ```ts
   * // Employee extends User — Employee gets all of User's columns plus its own.
   * const columns = storage.getMergedColumns(Employee);
   * ```
   */
  getMergedColumns(target: Function): Map<string, ColumnMetadata> {
    const chain = this.getPrototypeChain(target);
    const merged = new Map<string, ColumnMetadata>();

    // Walk from root ancestor → target so child overrides parent
    for (const ctor of chain) {
      const columns = this.getColumns(ctor);
      for (const [key, col] of columns) {
        merged.set(key, col);
      }
    }

    return merged;
  }

  /**
   * Get merged class-level metadata for a Model, including inherited class metadata.
   *
   * Walks the prototype chain and merges ClassMetadata objects. Child values override
   * parent values for scalar fields. The `observers` array is concatenated (parent first,
   * then child).
   *
   * @param target - The Model class constructor.
   * @returns The merged ClassMetadata.
   */
  getMergedClassMetadata(target: Function): ClassMetadata {
    const chain = this.getPrototypeChain(target);
    const merged = this.createDefaultClassMetadata();

    // Walk from root ancestor → target so child overrides parent
    for (const ctor of chain) {
      const meta = this.classMetadata.get(ctor);
      if (meta) {
        if (meta.collection !== undefined) merged.collection = meta.collection;
        if (meta.connection !== undefined) merged.connection = meta.connection;
        // Boolean flags: child overrides parent
        merged.timestamps = meta.timestamps;
        merged.softDeletes = meta.softDeletes;
        // Observers: concatenate (parent observers run first)
        merged.observers = [...merged.observers, ...meta.observers];
      }
    }

    return merged;
  }

  /**
   * Get merged relation metadata for a Model, including inherited relations.
   *
   * Child relations override parent relations for the same property key.
   *
   * @param target - The Model class constructor.
   * @returns A merged Map of property name → RelationMetadata.
   */
  getMergedRelations(target: Function): Map<string, RelationMetadata> {
    const chain = this.getPrototypeChain(target);
    const merged = new Map<string, RelationMetadata>();

    for (const ctor of chain) {
      const relations = this.getRelations(ctor);
      for (const [key, rel] of relations) {
        merged.set(key, rel);
      }
    }

    return merged;
  }

  /**
   * Get merged scope metadata for a Model, including inherited scopes.
   *
   * Child scopes override parent scopes for the same method name.
   *
   * @param target - The Model class constructor.
   * @returns A merged Map of method name → ScopeMetadata.
   */
  getMergedScopes(target: Function): Map<string, ScopeMetadata> {
    const chain = this.getPrototypeChain(target);
    const merged = new Map<string, ScopeMetadata>();

    for (const ctor of chain) {
      const scopes = this.getScopes(ctor);
      for (const [key, scope] of scopes) {
        merged.set(key, scope);
      }
    }

    return merged;
  }

  /**
   * Get merged hook metadata for a Model, including inherited hooks.
   *
   * Hooks are concatenated — parent hooks run before child hooks.
   *
   * @param target - The Model class constructor.
   * @returns A concatenated array of HookMetadata entries.
   */
  getMergedHooks(target: Function): HookMetadata[] {
    const chain = this.getPrototypeChain(target);
    const merged: HookMetadata[] = [];

    for (const ctor of chain) {
      merged.push(...this.getHooks(ctor));
    }

    return merged;
  }

  /**
   * Get merged accessor/mutator metadata for a Model, including inherited ones.
   *
   * Entries are concatenated — parent accessors/mutators come before child ones.
   *
   * @param target - The Model class constructor.
   * @returns A concatenated array of AccessorMutatorMetadata entries.
   */
  getMergedAccessorsMutators(target: Function): AccessorMutatorMetadata[] {
    const chain = this.getPrototypeChain(target);
    const merged: AccessorMutatorMetadata[] = [];

    for (const ctor of chain) {
      merged.push(...this.getAccessorsMutators(ctor));
    }

    return merged;
  }

  /**
   * Get merged fillable fields for a Model, including inherited ones.
   *
   * Returns the union of all fillable fields across the prototype chain.
   *
   * @param target - The Model class constructor.
   * @returns A Set of all fillable property names.
   */
  getMergedFillableFields(target: Function): Set<string> {
    const columns = this.getMergedColumns(target);
    const result = new Set<string>();
    for (const [key, col] of columns) {
      if (col.isFillable) result.add(key);
    }
    return result;
  }

  /**
   * Get merged guarded fields for a Model, including inherited ones.
   *
   * Returns the union of all guarded fields across the prototype chain.
   *
   * @param target - The Model class constructor.
   * @returns A Set of all guarded property names.
   */
  getMergedGuardedFields(target: Function): Set<string> {
    const columns = this.getMergedColumns(target);
    const result = new Set<string>();
    for (const [key, col] of columns) {
      if (col.isGuarded) result.add(key);
    }
    return result;
  }

  /**
   * Get merged hidden fields for a Model, including inherited ones.
   *
   * Returns the union of all hidden fields across the prototype chain.
   *
   * @param target - The Model class constructor.
   * @returns A Set of all hidden property names.
   */
  getMergedHiddenFields(target: Function): Set<string> {
    const columns = this.getMergedColumns(target);
    const result = new Set<string>();
    for (const [key, col] of columns) {
      if (col.isHidden) result.add(key);
    }
    return result;
  }

  /**
   * Get merged visible fields for a Model, including inherited ones.
   *
   * Returns the union of all visible fields across the prototype chain.
   *
   * @param target - The Model class constructor.
   * @returns A Set of all visible property names.
   */
  getMergedVisibleFields(target: Function): Set<string> {
    const columns = this.getMergedColumns(target);
    const result = new Set<string>();
    for (const [key, col] of columns) {
      if (col.isVisible) result.add(key);
    }
    return result;
  }

  /**
   * Get merged casts for a Model, including inherited ones.
   *
   * Child cast definitions override parent cast definitions for the same property.
   *
   * @param target - The Model class constructor.
   * @returns A Map of property name → cast type string.
   */
  getMergedCasts(target: Function): Map<string, string> {
    const columns = this.getMergedColumns(target);
    const result = new Map<string, string>();
    for (const [key, col] of columns) {
      if (col.castType !== undefined) result.set(key, col.castType);
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Testing Utilities
  // -------------------------------------------------------------------------

  /**
   * Reset all metadata maps. Used in tests to ensure a clean state between test cases.
   *
   * @example
   * ```ts
   * afterEach(() => {
   *   MetadataStorage.getInstance().clear();
   * });
   * ```
   */
  clear(): void {
    this.classMetadata.clear();
    this.columnMetadata.clear();
    this.relationMetadata.clear();
    this.scopeMetadata.clear();
    this.hookMetadata.clear();
    this.accessorMutatorMetadata.clear();
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Create a default ClassMetadata object with safe initial values.
   *
   * @returns A ClassMetadata with `timestamps: false`, `softDeletes: false`, empty observers.
   */
  private createDefaultClassMetadata(): ClassMetadata {
    return {
      collection: undefined,
      connection: undefined,
      timestamps: false,
      softDeletes: false,
      observers: [],
    };
  }

  /**
   * Create a default ColumnMetadata placeholder for a property.
   *
   * Used when a flag decorator (e.g. `@PrimaryKey`) runs before `@Column`.
   * The `options` field uses a placeholder type of `'string'` — it will be
   * overwritten when `@Column` eventually runs via `registerColumn`.
   *
   * @param propertyKey - The property name.
   * @returns A ColumnMetadata with all flags set to `false`.
   */
  private createDefaultColumnMetadata(propertyKey: string): ColumnMetadata {
    return {
      propertyKey,
      options: { type: 'string' },
      isPrimary: false,
      isFillable: false,
      isGuarded: false,
      isHidden: false,
      isVisible: false,
      isIndex: false,
      isFinal: false,
    };
  }

  /**
   * Walk the prototype chain of a class constructor and return an array of
   * constructors from the root ancestor down to the target (inclusive).
   *
   * Stops before `Object`, `Function.prototype`, or `null`. This ordering
   * ensures that when iterating the result, parent metadata is processed
   * first and child metadata can override it.
   *
   * @param target - The class constructor to start from.
   * @returns An array of constructors ordered from root ancestor → target.
   */
  private getPrototypeChain(target: Function): Function[] {
    const chain: Function[] = [];
    let current: Function | null = target;

    while (current && current !== Object && current !== Function.prototype) {
      chain.unshift(current);
      // Move to the parent class constructor
      current = Object.getPrototypeOf(current.prototype)?.constructor ?? null;
    }

    return chain;
  }
}

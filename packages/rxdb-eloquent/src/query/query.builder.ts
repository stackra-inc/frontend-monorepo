/**
 * @file query.builder.ts
 * @description Fluent, immutable, chainable query builder inspired by
 * Laravel's Eloquent QueryBuilder. Each chain method clones the internal
 * state and returns a **new** QueryBuilder instance, leaving the original
 * untouched.
 *
 * The QueryBuilder is generic over a Model type `T` so that field names
 * in `.where()` and return types from `.get()` / `.first()` are correctly
 * typed once the Model layer is wired up.
 *
 * Execution methods (`get`, `first`, `count`) compile the accumulated state
 * via the connection's QueryGrammar and execute against the RxDB collection.
 * Until the Model layer is built, these return placeholder results.
 *
 * Reactivity is exposed via `observe()` which returns an RxJS Observable
 * (placeholder for now).
 *
 * Local scopes are resolved dynamically via a Proxy that intercepts
 * unknown method calls and delegates to `scopeXxx` methods registered
 * in MetadataStorage.
 *
 * @example
 * ```ts
 * // Build a query (each call returns a new immutable instance)
 * const query = new QueryBuilder(UserModel)
 *   .where('age', '>', 18)
 *   .where('active', true)
 *   .orderBy('name', 'asc')
 *   .limit(10);
 *
 * // Execute
 * const users = await query.get();
 * const first = await query.first();
 * const total = await query.count();
 * ```
 */

import { Observable, of } from 'rxjs';
import { MangoQueryGrammar } from './grammars/mango-query.grammar';
import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Interfaces & Types
// ---------------------------------------------------------------------------

/**
 * Supported comparison operators for where clauses.
 *
 * Maps to both Mango operators (via MangoQueryGrammar) and SQL operators
 * (via SqlQueryGrammar).
 */
export type WhereOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not_in' | 'regex';

/**
 * A single WHERE condition in the query.
 *
 * @example
 * ```ts
 * const clause: WhereClause = {
 *   field: 'age',
 *   operator: '>',
 *   value: 18,
 *   boolean: 'and',
 * };
 * ```
 */
export interface WhereClause {
  /** The field (column) name to filter on. */
  field: string;

  /** The comparison operator. */
  operator: WhereOperator;

  /** The value to compare against. */
  value: any;

  /**
   * How this clause is combined with the previous clause.
   * `'and'` for AND logic, `'or'` for OR logic.
   */
  boolean: 'and' | 'or';
}

/**
 * A single ORDER BY directive in the query.
 *
 * @example
 * ```ts
 * const order: OrderByClause = { field: 'name', direction: 'asc' };
 * ```
 */
export interface OrderByClause {
  /** The field (column) name to sort by. */
  field: string;

  /** Sort direction — ascending or descending. */
  direction: 'asc' | 'desc';
}

/**
 * The complete internal state of a QueryBuilder instance.
 *
 * This is the intermediate representation that gets compiled by a
 * {@link QueryGrammar} into an executable query (Mango object or SQL string).
 *
 * @example
 * ```ts
 * const state: QueryBuilderState = {
 *   wheres: [],
 *   orders: [],
 *   limitValue: null,
 *   skipValue: null,
 *   withTrashedFlag: false,
 *   onlyTrashedFlag: false,
 *   withoutGlobalScopeNames: [],
 *   eagerLoads: [],
 * };
 * ```
 */
export interface QueryBuilderState {
  /** Accumulated WHERE clauses (AND and OR combined). */
  wheres: WhereClause[];

  /** Accumulated ORDER BY directives. */
  orders: OrderByClause[];

  /** Maximum number of results to return, or `null` for unlimited. */
  limitValue: number | null;

  /** Number of results to skip (offset), or `null` for none. */
  skipValue: number | null;

  /** When `true`, include soft-deleted documents in results. */
  withTrashedFlag: boolean;

  /** When `true`, return ONLY soft-deleted documents. */
  onlyTrashedFlag: boolean;

  /** Names of global scopes to exclude from this query. */
  withoutGlobalScopeNames: string[];

  /** Relation names to eager-load with the query results. */
  eagerLoads: string[];
}

// ---------------------------------------------------------------------------
// QueryBuilder
// ---------------------------------------------------------------------------

/**
 * Fluent, immutable query builder that accumulates query conditions and
 * compiles them via a {@link QueryGrammar} for execution.
 *
 * Every chain method (`where`, `orderBy`, `limit`, etc.) returns a **new**
 * QueryBuilder instance with cloned state — the original is never mutated.
 *
 * @typeParam T - The Model type this query targets. Used for type-safe
 *               field names and return types once the Model layer is wired up.
 *               Defaults to `any` for standalone usage.
 *
 * @example
 * ```ts
 * const qb = new QueryBuilder(UserModel);
 * const filtered = qb.where('age', '>', 18).orderBy('name').limit(5);
 *
 * // Original is unchanged
 * console.log(qb.getState().wheres.length);       // 0
 * console.log(filtered.getState().wheres.length);  // 1
 * ```
 */
export class QueryBuilder<T = any> {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * The internal query state. Cloned on every chain method call to
   * preserve immutability.
   * @internal
   */
  private state: QueryBuilderState;

  /**
   * Reference to the Model class this query targets.
   * Used to resolve collection names and hydrate results.
   */
  private modelClass: any;

  /**
   * Reference to the database connection for query execution.
   * Used as a fallback when the Model's ConnectionManager is not available.
   */
  private connection: any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new QueryBuilder instance.
   *
   * @param modelClass  - The Model class this query targets (optional, `any` for now).
   * @param connection  - The database connection for execution (optional, `any` for now).
   * @param initialState - An optional pre-populated state (used internally for cloning).
   *
   * @example
   * ```ts
   * // Create a fresh query builder
   * const qb = new QueryBuilder(UserModel);
   *
   * // Create with pre-populated state (internal use)
   * const qb2 = new QueryBuilder(UserModel, conn, existingState);
   * ```
   */
  constructor(modelClass?: any, connection?: any, initialState?: QueryBuilderState) {
    this.modelClass = modelClass ?? null;
    this.connection = connection ?? null;
    this.state = initialState ?? this.createDefaultState();
  }

  // -------------------------------------------------------------------------
  // Where Clauses
  // -------------------------------------------------------------------------

  /**
   * Add a WHERE condition to the query.
   *
   * Supports two call signatures:
   * - `where(field, value)` — shorthand for `where(field, '=', value)`
   * - `where(field, operator, value)` — explicit operator
   *
   * @param field          - The field name to filter on.
   * @param operatorOrValue - The operator string, or the value (if using shorthand).
   * @param value          - The comparison value (when using 3-arg form).
   * @returns A new QueryBuilder with the added WHERE clause.
   *
   * @example
   * ```ts
   * // Shorthand: field = value
   * qb.where('name', 'Alice');
   *
   * // Explicit operator
   * qb.where('age', '>', 18);
   * qb.where('status', 'in', ['active', 'pending']);
   * ```
   */
  where(field: string, operatorOrValue: any, value?: any): QueryBuilder<T> {
    const newState = this.cloneState();

    if (value === undefined) {
      // Two-arg form: where(field, value) → where(field, '=', value)
      newState.wheres.push({
        field,
        operator: '=',
        value: operatorOrValue,
        boolean: 'and',
      });
    } else {
      // Three-arg form: where(field, operator, value)
      newState.wheres.push({
        field,
        operator: operatorOrValue as WhereOperator,
        value,
        boolean: 'and',
      });
    }

    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  /**
   * Add an OR WHERE condition to the query.
   *
   * The condition is combined with the previous clause using OR logic.
   *
   * @param field    - The field name to filter on.
   * @param operator - The comparison operator.
   * @param value    - The comparison value.
   * @returns A new QueryBuilder with the added OR WHERE clause.
   *
   * @example
   * ```ts
   * qb.where('age', '>', 18).orWhere('role', '=', 'admin');
   * // Produces: age > 18 OR role = 'admin'
   * ```
   */
  orWhere(field: string, operator: WhereOperator, value: any): QueryBuilder<T> {
    const newState = this.cloneState();

    newState.wheres.push({
      field,
      operator,
      value,
      boolean: 'or',
    });

    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  // -------------------------------------------------------------------------
  // Ordering
  // -------------------------------------------------------------------------

  /**
   * Add an ORDER BY directive to the query.
   *
   * @param field     - The field name to sort by.
   * @param direction - Sort direction, defaults to `'asc'`.
   * @returns A new QueryBuilder with the added ORDER BY directive.
   *
   * @example
   * ```ts
   * qb.orderBy('name');           // ASC by default
   * qb.orderBy('created_at', 'desc');
   * ```
   */
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
    const newState = this.cloneState();

    newState.orders.push({ field, direction });

    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  /**
   * Set the maximum number of results to return.
   *
   * @param count - The limit value.
   * @returns A new QueryBuilder with the limit applied.
   *
   * @example
   * ```ts
   * qb.limit(10); // Return at most 10 results
   * ```
   */
  limit(count: number): QueryBuilder<T> {
    const newState = this.cloneState();
    newState.limitValue = count;
    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  /**
   * Set the number of results to skip (offset).
   *
   * @param count - The skip/offset value.
   * @returns A new QueryBuilder with the skip applied.
   *
   * @example
   * ```ts
   * qb.skip(20); // Skip the first 20 results
   * ```
   */
  skip(count: number): QueryBuilder<T> {
    const newState = this.cloneState();
    newState.skipValue = count;
    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  // -------------------------------------------------------------------------
  // Soft Delete Scopes
  // -------------------------------------------------------------------------

  /**
   * Include soft-deleted documents in the query results.
   *
   * By default, queries on Models with `@SoftDeletes()` exclude documents
   * where `deleted_at` is set. This method removes that filter.
   *
   * @returns A new QueryBuilder with the withTrashed flag set.
   *
   * @example
   * ```ts
   * const allUsers = await qb.withTrashed().get();
   * ```
   */
  withTrashed(): QueryBuilder<T> {
    const newState = this.cloneState();
    newState.withTrashedFlag = true;
    newState.onlyTrashedFlag = false;
    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  /**
   * Return ONLY soft-deleted documents.
   *
   * @returns A new QueryBuilder with the onlyTrashed flag set.
   *
   * @example
   * ```ts
   * const trashedUsers = await qb.onlyTrashed().get();
   * ```
   */
  onlyTrashed(): QueryBuilder<T> {
    const newState = this.cloneState();
    newState.onlyTrashedFlag = true;
    newState.withTrashedFlag = false;
    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  // -------------------------------------------------------------------------
  // Global Scope Removal
  // -------------------------------------------------------------------------

  /**
   * Remove a specific global scope from this query by name.
   *
   * @param name - The name of the global scope to remove.
   * @returns A new QueryBuilder without the specified global scope.
   *
   * @example
   * ```ts
   * qb.withoutGlobalScope('verified');
   * ```
   */
  withoutGlobalScope(name: string): QueryBuilder<T> {
    const newState = this.cloneState();

    if (!newState.withoutGlobalScopeNames.includes(name)) {
      newState.withoutGlobalScopeNames.push(name);
    }

    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  /**
   * Remove ALL global scopes from this query.
   *
   * Sets a special flag that tells the execution layer to skip
   * all global scope application.
   *
   * @returns A new QueryBuilder with all global scopes removed.
   *
   * @example
   * ```ts
   * qb.withoutGlobalScopes();
   * ```
   */
  withoutGlobalScopes(): QueryBuilder<T> {
    const newState = this.cloneState();
    // Use a sentinel value to indicate "remove all"
    newState.withoutGlobalScopeNames = ['*'];
    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  // -------------------------------------------------------------------------
  // Eager Loading
  // -------------------------------------------------------------------------

  /**
   * Specify relations to eager-load with the query results.
   *
   * Eager loading prevents N+1 query problems by batch-loading
   * related documents after the main query executes.
   *
   * @param relations - One or more relation names to eager-load.
   * @returns A new QueryBuilder with the eager loads registered.
   *
   * @example
   * ```ts
   * qb.with('posts', 'profile');
   * ```
   */
  with(...relations: string[]): QueryBuilder<T> {
    const newState = this.cloneState();

    for (const rel of relations) {
      if (!newState.eagerLoads.includes(rel)) {
        newState.eagerLoads.push(rel);
      }
    }

    return new QueryBuilder<T>(this.modelClass, this.connection, newState);
  }

  // -------------------------------------------------------------------------
  // Execution Methods (placeholders until Model layer is wired)
  // -------------------------------------------------------------------------

  /**
   * Execute the query and return all matching results.
   *
   * Compiles the query state via the MangoQueryGrammar and
   * executes against the RxDB collection.
   *
   * @returns A promise resolving to an array of Model instances.
   *
   * @example
   * ```ts
   * const users = await qb.where('active', true).get();
   * ```
   */
  async get(): Promise<T[]> {
    const modelClass = this.modelClass as any;
    if (!modelClass?.resolveCollection) return [];

    const collection = await modelClass.resolveCollection();
    const mangoQuery = this.compileMango();
    const docs = await collection.find(mangoQuery).exec();
    const results = docs.map((doc: any) => modelClass.hydrate(doc));

    // Eager load relations
    if (this.state.eagerLoads.length > 0 && results.length > 0) {
      for (const relationName of this.state.eagerLoads) {
        for (const model of results) {
          const relation = (model as any).getRelation?.(relationName);
          if (relation) {
            const related = await relation.get();
            // Store the loaded relation on the model instance
            (model as any)._loadedRelations = (model as any)._loadedRelations ?? {};
            (model as any)._loadedRelations[relationName] = related;
          }
        }
      }
    }

    return results;
  }

  /**
   * Execute the query and return the first matching result.
   *
   * Applies a limit of 1 internally and returns the single result
   * or `null` if no documents match.
   *
   * @returns A promise resolving to a single Model instance or `null`.
   *
   * @example
   * ```ts
   * const user = await qb.where('email', 'alice@example.com').first();
   * ```
   */
  async first(): Promise<T | null> {
    const modelClass = this.modelClass as any;
    if (!modelClass?.resolveCollection) return null;

    const collection = await modelClass.resolveCollection();

    // Apply global scopes before compilation
    this.applyGlobalScopes();

    const grammar = new MangoQueryGrammar();
    let softDeleteField: string | null = null;
    if (this.modelClass) {
      const storage = MetadataStorage.getInstance();
      const classMeta = storage.getMergedClassMetadata(this.modelClass);
      if (classMeta.softDeletes && !this.state.withTrashedFlag) {
        softDeleteField = (this.modelClass as any).DELETED_AT ?? 'deleted_at';
      }
    }
    const limitedState = { ...this.cloneState(), limitValue: 1 };
    const mangoQuery = grammar.compile(limitedState, softDeleteField, limitedState.onlyTrashedFlag);

    /** Strip limit from the query — findOne() adds its own limit internally. */
    delete mangoQuery.limit;

    const doc = await collection.findOne(mangoQuery).exec();
    if (!doc) return null;
    return modelClass.hydrate(doc);
  }

  /**
   * Execute the query and return the count of matching documents.
   *
   * @returns A promise resolving to the number of matching documents.
   *
   * @example
   * ```ts
   * const total = await qb.where('active', true).count();
   * ```
   */
  async count(): Promise<number> {
    const modelClass = this.modelClass as any;
    if (!modelClass?.resolveCollection) return 0;

    const collection = await modelClass.resolveCollection();
    const mangoQuery = this.compileMango();
    return collection.count(mangoQuery).exec();
  }

  // -------------------------------------------------------------------------
  // Reactivity
  // -------------------------------------------------------------------------

  /**
   * Return an Observable that emits the latest query result set
   * whenever the underlying data changes.
   *
   * This leverages RxDB's reactive query system under the hood.
   *
   * @returns An RxJS Observable emitting arrays of Model instances.
   *
   * @example
   * ```ts
   * qb.where('active', true).observe().subscribe(users => {
   *   console.log('Active users:', users);
   * });
   * ```
   */
  observe(): Observable<T[]> {
    const modelClass = this.modelClass as any;
    if (!modelClass?.resolveCollection) return of([]);

    return new Observable<T[]>((subscriber) => {
      let sub: any;
      (async () => {
        const collection = await modelClass.resolveCollection();
        const mangoQuery = this.compileMango();
        sub = collection.find(mangoQuery).$.subscribe({
          next: (docs: any[]) => {
            subscriber.next(docs.map((doc: any) => modelClass.hydrate(doc)));
          },
          error: (err: any) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      })().catch((err) => subscriber.error(err));

      return () => { if (sub) sub.unsubscribe(); };
    });
  }

  // -------------------------------------------------------------------------
  // State Access
  // -------------------------------------------------------------------------

  /**
   * Get a read-only copy of the current query builder state.
   *
   * Useful for grammar compilation, debugging, and testing.
   *
   * @returns A deep clone of the internal {@link QueryBuilderState}.
   *
   * @example
   * ```ts
   * const state = qb.where('age', '>', 18).getState();
   * console.log(state.wheres); // [{ field: 'age', operator: '>', value: 18, boolean: 'and' }]
   * ```
   */
  getState(): QueryBuilderState {
    return this.cloneState();
  }

  /**
   * Get the model class associated with this query builder.
   *
   * @returns The model class, or `null` if not set.
   */
  getModelClass(): any {
    return this.modelClass;
  }

  /**
   * Get the connection associated with this query builder.
   *
   * @returns The connection, or `null` if not set.
   */
  getConnection(): any {
    return this.connection;
  }

  // -------------------------------------------------------------------------
  // Local Scope Proxy
  // -------------------------------------------------------------------------

  /**
   * Create a proxied QueryBuilder that intercepts unknown method calls
   * and delegates them to local scope methods registered via `@Scope()`
   * in MetadataStorage.
   *
   * When a method like `.active()` is called on the proxy, it looks up
   * `scopeActive` on the model class and invokes it with the current
   * QueryBuilder, returning the modified QueryBuilder.
   *
   * @returns A Proxy-wrapped QueryBuilder with dynamic scope resolution.
   *
   * @example
   * ```ts
   * // Assuming User has @Scope() scopeActive(qb) { return qb.where('active', true); }
   * const proxied = QueryBuilder.createProxy(UserModel);
   * const result = proxied.active().get(); // calls scopeActive internally
   * ```
   */
  static createProxy<T = any>(
    modelClass?: any,
    connection?: any,
    initialState?: QueryBuilderState
  ): QueryBuilder<T> & Record<string, (...args: any[]) => QueryBuilder<T>> {
    const builder = new QueryBuilder<T>(modelClass, connection, initialState);

    return new Proxy(builder, {
      get(target: any, prop: string | symbol, receiver: any) {
        // If the property exists on the QueryBuilder, return it directly
        if (prop in target || typeof prop === 'symbol') {
          return Reflect.get(target, prop, receiver);
        }

        // Attempt to resolve as a local scope on the model class
        if (typeof prop === 'string' && target.modelClass) {
          const scopeMethodName = `scope${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;

          // Check if the model class prototype has the scope method
          if (typeof target.modelClass.prototype?.[scopeMethodName] === 'function') {
            return (...args: any[]) => {
              // Create a temporary model instance to call the scope method
              const instance = Object.create(target.modelClass.prototype);
              return instance[scopeMethodName](target, ...args);
            };
          }
        }

        return undefined;
      },
    }) as QueryBuilder<T> & Record<string, (...args: any[]) => QueryBuilder<T>>;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Compile the current query state into a Mango query, injecting soft-delete
   * scope and global scopes if applicable.
   *
   * @returns A MangoQuery object ready for RxCollection operations.
   */
  private compileMango(): any {
    // Apply global scopes before compilation
    this.applyGlobalScopes();

    const grammar = new MangoQueryGrammar();

    let softDeleteField: string | null = null;
    if (this.modelClass) {
      const storage = MetadataStorage.getInstance();
      const classMeta = storage.getMergedClassMetadata(this.modelClass);
      if (classMeta.softDeletes && !this.state.withTrashedFlag) {
        softDeleteField = (this.modelClass as any).DELETED_AT ?? 'deleted_at';
      }
    }

    return grammar.compile(this.state, softDeleteField, this.state.onlyTrashedFlag);
  }

  /**
   * Apply registered global scopes to the current query state.
   *
   * Reads global scopes from the model class and merges their where
   * clauses into the current state, respecting `withoutGlobalScopeNames`.
   *
   * @internal
   */
  private applyGlobalScopes(): void {
    if (!this.modelClass) return;

    const tempInstance = new this.modelClass();
    const scopes = tempInstance.getGlobalScopes?.();
    if (!scopes || scopes.size === 0) return;

    for (const [scopeName, scope] of scopes) {
      // Skip excluded scopes
      if (
        this.state.withoutGlobalScopeNames.includes('*') ||
        this.state.withoutGlobalScopeNames.includes(scopeName)
      ) {
        continue;
      }

      let scopedBuilder: any;
      if (typeof scope === 'function') {
        scopedBuilder = scope(this);
      } else if (scope && typeof scope.apply === 'function') {
        scopedBuilder = scope.apply(this);
      }

      // Merge scoped wheres into our state (deduplicate by field+value)
      if (scopedBuilder && scopedBuilder !== this) {
        const scopedState = scopedBuilder.getState();
        for (const w of scopedState.wheres) {
          const isDuplicate = this.state.wheres.some(
            (ew: any) => ew.field === w.field && ew.value === w.value
          );
          if (!isDuplicate) {
            this.state.wheres.push(w);
          }
        }
      }
    }
  }

  /**
   * Create a default (empty) query builder state.
   *
   * @returns A fresh {@link QueryBuilderState} with all fields at their defaults.
   */
  private createDefaultState(): QueryBuilderState {
    return {
      wheres: [],
      orders: [],
      limitValue: null,
      skipValue: null,
      withTrashedFlag: false,
      onlyTrashedFlag: false,
      withoutGlobalScopeNames: [],
      eagerLoads: [],
    };
  }

  /**
   * Deep-clone the current state to preserve immutability.
   *
   * Arrays are shallow-copied (WhereClause and OrderByClause objects
   * are treated as immutable value objects). Primitive values are
   * copied by value.
   *
   * @returns A cloned copy of the current {@link QueryBuilderState}.
   */
  private cloneState(): QueryBuilderState {
    return {
      wheres: [...this.state.wheres.map((w) => ({ ...w }))],
      orders: [...this.state.orders.map((o) => ({ ...o }))],
      limitValue: this.state.limitValue,
      skipValue: this.state.skipValue,
      withTrashedFlag: this.state.withTrashedFlag,
      onlyTrashedFlag: this.state.onlyTrashedFlag,
      withoutGlobalScopeNames: [...this.state.withoutGlobalScopeNames],
      eagerLoads: [...this.state.eagerLoads],
    };
  }
}

/**
 * @file has-global-scopes.concern.ts
 * @description Mixin/concern that provides global scope registration and management
 * for Model instances.
 *
 * Global scopes are query constraints that are automatically applied to every query
 * for a given Model. They can be registered via the `@GlobalScope()` decorator or
 * programmatically via `registerGlobalScope()`. Individual scopes can be removed
 * from a query via `withoutGlobalScope(name)`.
 *
 * Reads `@GlobalScope()` metadata from MetadataStorage to auto-register scopes
 * defined as decorated methods on the Model class.
 *
 * @example
 * ```ts
 * class User extends HasGlobalScopes(BaseClass) {
 *   @GlobalScope('active')
 *   scopeActive(query: any): any {
 *     return query.where('active', '=', true);
 *   }
 * }
 *
 * // Programmatic registration:
 * User.registerGlobalScope('verified', {
 *   apply(query) { return query.where('verified', '=', true); }
 * });
 * ```
 */

import { MetadataStorage } from '@/metadata/metadata.storage';
import type { Scope } from '@/scopes/scope';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A global scope can be either a Scope object with an `apply` method,
 * or a plain function that receives and returns a QueryBuilder.
 */
export type GlobalScopeEntry = Scope | ((queryBuilder: any) => any);

/**
 * Interface for the HasGlobalScopes concern.
 *
 * Defines the contract for global scope management on Model instances/classes.
 */
export interface HasGlobalScopesInterface {
  /** Register a named global scope. */
  registerGlobalScope(name: string, scope: GlobalScopeEntry): void;
  /** Remove a named global scope. */
  removeGlobalScope(name: string): void;
  /** Get all registered global scopes. */
  getGlobalScopes(): Map<string, GlobalScopeEntry>;
  /** Apply all registered global scopes to a query builder. */
  applyGlobalScopes(queryBuilder: any): any;
}

// ---------------------------------------------------------------------------
// HasGlobalScopes Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds global scope management to a base class.
 *
 * Provides `registerGlobalScope`, `removeGlobalScope`, `getGlobalScopes`,
 * and `applyGlobalScopes` methods. Reads `@GlobalScope()` metadata from
 * MetadataStorage to auto-register decorator-defined scopes.
 *
 * Global scopes are stored per-class (on the constructor) so that all
 * instances of a Model share the same set of global scopes.
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with HasGlobalScopes functionality.
 *
 * @example
 * ```ts
 * class Post extends HasGlobalScopes(BaseClass) {}
 *
 * const post = new Post();
 * post.registerGlobalScope('published', {
 *   apply(qb) { return qb.where('published', '=', true); }
 * });
 *
 * const scopes = post.getGlobalScopes();
 * // Map { 'published' => { apply: [Function] } }
 * ```
 */
export function HasGlobalScopes<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class HasGlobalScopesMixin extends Base implements HasGlobalScopesInterface {
    /**
     * Internal map of registered global scopes, keyed by scope name.
     * Stored on the instance but typically shared via class-level registration.
     * @internal
     */
    _globalScopes: Map<string, GlobalScopeEntry> = new Map();

    /**
     * Whether metadata-based scopes have been loaded for this instance.
     * @internal
     */
    _scopesInitialized: boolean = false;

    /**
     * Register a named global scope.
     *
     * The scope will be automatically applied to every query for this Model
     * unless explicitly removed via `withoutGlobalScope(name)`.
     *
     * @param name  - A unique name for the scope (used for removal).
     * @param scope - A Scope object with an `apply` method, or a function.
     *
     * @example
     * ```ts
     * model.registerGlobalScope('active', {
     *   apply(qb) { return qb.where('active', '=', true); }
     * });
     *
     * // Or with a plain function:
     * model.registerGlobalScope('recent', (qb) => qb.orderBy('created_at', 'desc'));
     * ```
     */
    registerGlobalScope(name: string, scope: GlobalScopeEntry): void {
      this._ensureScopesInitialized();
      this._globalScopes.set(name, scope);
    }

    /**
     * Remove a specific global scope by name.
     *
     * After removal, the scope will no longer be applied to queries.
     *
     * @param name - The name of the global scope to remove.
     *
     * @example
     * ```ts
     * model.removeGlobalScope('active');
     * ```
     */
    removeGlobalScope(name: string): void {
      this._ensureScopesInitialized();
      this._globalScopes.delete(name);
    }

    /**
     * Get all registered global scopes.
     *
     * Returns a Map of scope name → scope entry. Includes both
     * decorator-registered and programmatically-registered scopes.
     *
     * @returns A Map of all global scopes.
     *
     * @example
     * ```ts
     * const scopes = model.getGlobalScopes();
     * for (const [name, scope] of scopes) {
     *   console.log(`Scope: ${name}`);
     * }
     * ```
     */
    getGlobalScopes(): Map<string, GlobalScopeEntry> {
      this._ensureScopesInitialized();
      return new Map(this._globalScopes);
    }

    /**
     * Apply all registered global scopes to a query builder.
     *
     * Iterates over all global scopes and applies each one to the
     * query builder in registration order. Each scope receives the
     * current query builder and returns a modified one.
     *
     * @param queryBuilder - The QueryBuilder instance to apply scopes to.
     *                       Typed as `any` until Model generics are finalized.
     *                       TODO: Replace with `QueryBuilder<T>` once available.
     * @returns The modified QueryBuilder with all global scopes applied.
     *
     * @example
     * ```ts
     * let qb = new QueryBuilder(UserModel);
     * qb = model.applyGlobalScopes(qb);
     * // qb now has all global scope constraints applied
     * ```
     */
    applyGlobalScopes(queryBuilder: any): any {
      this._ensureScopesInitialized();

      let result = queryBuilder;

      for (const [, scope] of this._globalScopes) {
        if (typeof scope === 'function') {
          // Plain function scope
          result = scope(result);
        } else if (scope && typeof scope.apply === 'function') {
          // Scope object with apply() method
          result = scope.apply(result);
        }
      }

      return result;
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Ensure that metadata-based global scopes have been loaded.
     *
     * Reads `@GlobalScope()` metadata from MetadataStorage on first access
     * and registers each decorated method as a global scope.
     *
     * @internal
     */
    _ensureScopesInitialized(): void {
      if (this._scopesInitialized) {
        return;
      }
      this._scopesInitialized = true;

      const storage = MetadataStorage.getInstance();
      const scopes = storage.getMergedScopes(this.constructor);

      for (const [, scopeMeta] of scopes) {
        if (scopeMeta.type === 'global' && scopeMeta.name) {
          // Create a scope entry that calls the decorated method
          const methodName = scopeMeta.methodName;
          const scopeName = scopeMeta.name;
          const self = this;

          this._globalScopes.set(scopeName, (qb: any) => {
            if (typeof (self as any)[methodName] === 'function') {
              return (self as any)[methodName](qb);
            }
            return qb;
          });
        }
      }
    }
  };
}

/**
 * @file scope.ts
 * @description Defines the Scope interface for global query scopes in the rxdb-eloquent package.
 *
 * A Scope is a reusable query constraint that can be applied to a Model's QueryBuilder.
 * Global scopes are automatically applied to every query for a Model, while local scopes
 * are applied on-demand via fluent chain methods.
 *
 * Implement this interface to create custom global scopes that can be registered on
 * Models via the `@GlobalScope()` decorator or the `HasGlobalScopes` concern.
 *
 * @example
 * ```ts
 * import { Scope } from '@/scopes/scope';
 *
 * class ActiveScope implements Scope {
 *   apply(queryBuilder: any): any {
 *     return queryBuilder.where('active', '=', true);
 *   }
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Scope Interface
// ---------------------------------------------------------------------------

/**
 * Interface for global query scopes.
 *
 * A Scope encapsulates a reusable query constraint that can be automatically
 * applied to every query for a given Model. Scopes modify the QueryBuilder
 * by adding WHERE clauses, ordering, or other query modifications.
 *
 * @example
 * ```ts
 * class PublishedScope implements Scope {
 *   apply(queryBuilder: any): any {
 *     return queryBuilder.where('published', '=', true);
 *   }
 * }
 *
 * class VerifiedScope implements Scope {
 *   apply(queryBuilder: any): any {
 *     return queryBuilder.where('verified_at', '!=', null);
 *   }
 * }
 * ```
 */
export interface Scope {
  /**
   * Apply the scope constraint to the given query builder.
   *
   * This method receives a QueryBuilder instance and should return a modified
   * QueryBuilder with the scope's constraints applied. The QueryBuilder is
   * immutable, so each `.where()` call returns a new instance.
   *
   * @param queryBuilder - The QueryBuilder instance to apply the scope to.
   *                       Typed as `any` until the Model layer is fully wired.
   *                       TODO: Replace with `QueryBuilder<T>` once Model generics are finalized.
   * @returns The modified QueryBuilder with the scope's constraints applied.
   *
   * @example
   * ```ts
   * apply(queryBuilder: any): any {
   *   return queryBuilder.where('status', '=', 'active');
   * }
   * ```
   */
  apply(queryBuilder: any): any;
}

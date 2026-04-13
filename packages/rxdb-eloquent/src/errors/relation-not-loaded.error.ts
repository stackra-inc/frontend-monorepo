/**
 * @file relation-not-loaded.error.ts
 * @description Error thrown in strict mode when accessing a
 * relation property that hasn't been eager-loaded or
 * explicitly loaded. This helps catch N+1 query problems
 * during development. In non-strict mode, relations are
 * lazily loaded on access instead.
 */

/**
 * Thrown when a relation is accessed on a Model instance
 * but hasn't been loaded (either via eager loading with
 * `Model.with()` or explicit `relation.get()`).
 *
 * @example
 * ```ts
 * throw new RelationNotLoadedError('User', 'posts');
 * // Error: Relation "posts" has not been loaded on model "User".
 * ```
 */
export class RelationNotLoadedError extends Error {
  /**
   * The name of the Model class where the relation was accessed.
   */
  public readonly model: string;

  /**
   * The name of the relation that was accessed without loading.
   */
  public readonly relation: string;

  /**
   * @param model - The Model class name (e.g. 'User')
   * @param relation - The relation property name (e.g. 'posts')
   */
  constructor(model: string, relation: string) {
    super(`Relation "${relation}" has not been loaded on model "${model}".`);
    this.model = model;
    this.relation = relation;
    Object.setPrototypeOf(this, RelationNotLoadedError.prototype);
  }
}

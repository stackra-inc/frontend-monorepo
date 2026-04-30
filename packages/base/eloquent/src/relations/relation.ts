/**
 * @file relation.ts
 * @description Abstract base class for all relationship types in the rxdb-eloquent package.
 *
 * Provides the generic `Relation<TParent, TRelated>` contract with abstract `get()`
 * and `observe()` methods that concrete relation classes must implement.
 *
 * All relations hold a reference to the parent model instance, the related model
 * class, and the key configuration needed to resolve the relationship.
 *
 * @example
 * ```ts
 * // Concrete relation usage:
 * const relation = user.getRelation('posts');
 * const posts = await relation.get();
 * relation.observe().subscribe(posts => console.log(posts));
 * ```
 */

import { type Observable } from 'rxjs';

// ---------------------------------------------------------------------------
// Abstract Relation
// ---------------------------------------------------------------------------

/**
 * Abstract base class for all relationship types.
 *
 * Defines the contract that all concrete relation classes (HasOne, HasMany,
 * BelongsTo, BelongsToMany) must implement. Holds references to the parent
 * model instance and the related model class.
 *
 * @typeParam TParent  - The parent Model type that owns this relation.
 * @typeParam TRelated - The related Model type that this relation resolves to.
 *
 * @example
 * ```ts
 * class HasOneRelation<P, R> extends Relation<P, R> {
 *   async get(): Promise<R | null> { ... }
 *   observe(): Observable<R | null> { ... }
 * }
 * ```
 */
export abstract class Relation<TParent = any, TRelated = any> {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * The parent model instance that owns this relation.
   *
   * Used to read the parent's key values for building the relation query.
   */
  protected readonly parent: TParent;

  /**
   * The related model class (constructor).
   *
   * Used to query the related collection and hydrate results.
   * Typed as `any` until ModelStatic<T> generics are fully resolved.
   */
  protected readonly related: any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new Relation instance.
   *
   * @param parent  - The parent model instance.
   * @param related - The related model class (constructor).
   */
  constructor(parent: TParent, related: any) {
    this.parent = parent;
    this.related = related;
  }

  // -------------------------------------------------------------------------
  // Abstract Methods
  // -------------------------------------------------------------------------

  /**
   * Resolve the relation and return the related model(s).
   *
   * Concrete implementations query the related collection using the
   * appropriate key configuration and return the result.
   *
   * @returns A promise resolving to the related model(s).
   *          - HasOne / BelongsTo: `TRelated | null`
   *          - HasMany / BelongsToMany: `TRelated[]`
   *
   * @example
   * ```ts
   * const profile = await user.getRelation('profile').get();
   * const posts = await user.getRelation('posts').get();
   * ```
   */
  abstract get(): Promise<TRelated | TRelated[] | null>;

  /**
   * Return an Observable that emits the latest related model(s)
   * whenever the underlying data changes.
   *
   * Leverages RxDB's reactive query system for live updates.
   *
   * @returns An RxJS Observable emitting the related model(s).
   *
   * @example
   * ```ts
   * user.getRelation('posts').observe().subscribe(posts => {
   *   console.log('Posts updated:', posts.length);
   * });
   * ```
   */
  abstract observe(): Observable<TRelated | TRelated[] | null>;

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /**
   * Get the parent model instance.
   *
   * @returns The parent model.
   */
  getParent(): TParent {
    return this.parent;
  }

  /**
   * Get the related model class.
   *
   * @returns The related model class constructor.
   */
  getRelated(): any {
    return this.related;
  }
}

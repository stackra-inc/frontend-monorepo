/**
 * @file has-many.relation.ts
 * @description HasMany relationship implementation for the rxdb-eloquent package.
 *
 * Resolves a one-to-many relationship by querying the related collection:
 * `.where(foreignKey, '=', parentKeyValue).get()`
 *
 * @example
 * ```ts
 * // User has many Posts
 * const posts = await user.hasMany(Post, 'author_id').get();
 * // Queries: posts WHERE author_id = user.id
 * ```
 */

import { type Observable, of } from 'rxjs';
import { Relation } from './relation';

// ---------------------------------------------------------------------------
// HasManyRelation
// ---------------------------------------------------------------------------

/**
 * Represents a has-many relationship between a parent and related model.
 *
 * The related model's collection is queried with:
 * `WHERE foreignKey = parent[localKey]`
 *
 * Returns an array of related model instances.
 *
 * @typeParam TParent  - The parent Model type.
 * @typeParam TRelated - The related Model type.
 *
 * @example
 * ```ts
 * const relation = new HasManyRelation(user, Post, 'author_id', 'id');
 * const posts = await relation.get(); // Post[]
 * ```
 */
export class HasManyRelation<TParent = any, TRelated = any> extends Relation<TParent, TRelated> {
  /**
   * The foreign key on the related model's collection.
   * E.g., `'author_id'` on the posts collection.
   */
  private readonly foreignKey: string;

  /**
   * The local key on the parent model.
   * Defaults to the parent's primary key (e.g., `'id'`).
   */
  private readonly localKey: string;

  /**
   * Create a new HasManyRelation.
   *
   * @param parent     - The parent model instance.
   * @param related    - The related model class.
   * @param foreignKey - The foreign key on the related collection.
   * @param localKey   - The local key on the parent model.
   */
  constructor(parent: TParent, related: any, foreignKey: string, localKey: string) {
    super(parent, related);
    this.foreignKey = foreignKey;
    this.localKey = localKey;
  }

  /**
   * Resolve the has-many relationship.
   *
   * Queries the related collection: `.where(foreignKey, '=', parentKeyValue).get()`
   *
   * @returns A promise resolving to an array of related model instances.
   *
   * @example
   * ```ts
   * const posts = await relation.get();
   * console.log(`Found ${posts.length} posts`);
   * ```
   */
  async get(): Promise<TRelated[]> {
    const parentKeyValue = this.getParentKeyValue();
    if (parentKeyValue === null || parentKeyValue === undefined) return [];

    const RelatedModel = this.related;
    if (typeof RelatedModel.query === 'function') {
      return RelatedModel.query().where(this.foreignKey, parentKeyValue).get();
    }
    return [];
  }

  /**
   * Observe live changes to the has-many relationship.
   *
   * Returns an Observable that emits the latest array of related models
   * whenever the underlying data changes.
   *
   * @returns An Observable emitting `TRelated[]`.
   *
   * @example
   * ```ts
   * relation.observe().subscribe(posts => {
   *   console.log('Posts count:', posts.length);
   * });
   * ```
   */
  observe(): Observable<TRelated[]> {
    const RelatedModel = this.related;
    const parentKeyValue = this.getParentKeyValue();

    if (parentKeyValue === null || parentKeyValue === undefined) return of([]);

    if (typeof RelatedModel.query === 'function') {
      return RelatedModel.query().where(this.foreignKey, parentKeyValue).observe();
    }
    return of([]);
  }

  /**
   * Get the foreign key name for this relation.
   *
   * @returns The foreign key string.
   */
  getForeignKey(): string {
    return this.foreignKey;
  }

  /**
   * Get the local key name for this relation.
   *
   * @returns The local key string.
   */
  getLocalKey(): string {
    return this.localKey;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Get the parent model's local key value.
   *
   * @returns The parent's local key value.
   * @internal
   */
  private getParentKeyValue(): any {
    const parent = this.parent as any;
    if (typeof parent.getAttribute === 'function') {
      return parent.getAttribute(this.localKey);
    }
    return parent[this.localKey];
  }
}

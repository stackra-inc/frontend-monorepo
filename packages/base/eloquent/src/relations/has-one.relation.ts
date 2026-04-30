/**
 * @file has-one.relation.ts
 * @description HasOne relationship implementation for the rxdb-eloquent package.
 *
 * Resolves a one-to-one relationship by querying the related collection:
 * `.where(foreignKey, '=', parentKeyValue).first()`
 *
 * @example
 * ```ts
 * // User has one Profile
 * const profile = await user.hasOne(Profile, 'user_id').get();
 * // Queries: profiles WHERE user_id = user.id LIMIT 1
 * ```
 */

import { Observable, of } from 'rxjs';
import { Relation } from './relation';

// ---------------------------------------------------------------------------
// HasOneRelation
// ---------------------------------------------------------------------------

/**
 * Represents a has-one relationship between a parent and related model.
 *
 * The related model's collection is queried with:
 * `WHERE foreignKey = parent[localKey]`
 *
 * Returns a single related model instance or `null`.
 *
 * @typeParam TParent  - The parent Model type.
 * @typeParam TRelated - The related Model type.
 *
 * @example
 * ```ts
 * const relation = new HasOneRelation(user, Profile, 'user_id', 'id');
 * const profile = await relation.get(); // Profile | null
 * ```
 */
export class HasOneRelation<TParent = any, TRelated = any> extends Relation<TParent, TRelated> {
  /**
   * The foreign key on the related model's collection.
   * E.g., `'user_id'` on the profiles collection.
   */
  private readonly foreignKey: string;

  /**
   * The local key on the parent model.
   * Defaults to the parent's primary key (e.g., `'id'`).
   */
  private readonly localKey: string;

  /**
   * Create a new HasOneRelation.
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
   * Resolve the has-one relationship.
   *
   * Queries the related collection: `.where(foreignKey, '=', parentKeyValue).first()`
   *
   * @returns A promise resolving to the related model instance, or `null`.
   *
   * @example
   * ```ts
   * const profile = await relation.get();
   * ```
   */
  async get(): Promise<TRelated | null> {
    const parentKeyValue = this.getParentKeyValue();
    if (parentKeyValue === null || parentKeyValue === undefined) return null;

    const RelatedModel = this.related;
    if (typeof RelatedModel.query === 'function') {
      return RelatedModel.query().where(this.foreignKey, parentKeyValue).first();
    }
    return null;
  }

  /**
   * Observe live changes to the has-one relationship.
   *
   * Returns an Observable that emits the latest related model whenever
   * the underlying data changes.
   *
   * @returns An Observable emitting `TRelated | null`.
   *
   * @example
   * ```ts
   * relation.observe().subscribe(profile => {
   *   console.log('Profile:', profile);
   * });
   * ```
   */
  observe(): Observable<TRelated | null> {
    const RelatedModel = this.related;
    const parentKeyValue = this.getParentKeyValue();

    if (parentKeyValue === null || parentKeyValue === undefined) return of(null);

    if (typeof RelatedModel.query === 'function') {
      return new Observable<TRelated | null>((subscriber) => {
        const sub = RelatedModel.query()
          .where(this.foreignKey, parentKeyValue)
          .observe()
          .subscribe({
            next: (results: any[]) => subscriber.next(results[0] ?? null),
            error: (err: any) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        return () => sub.unsubscribe();
      });
    }
    return of(null);
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
   * Reads the attribute from the parent model using `getAttribute()` if
   * available, otherwise falls back to direct property access.
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

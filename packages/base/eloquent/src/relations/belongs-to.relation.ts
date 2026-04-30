/**
 * @file belongs-to.relation.ts
 * @description BelongsTo relationship implementation for the rxdb-eloquent package.
 *
 * Resolves an inverse one-to-one/one-to-many relationship by reading the
 * foreign key value from the child model and finding the parent model by
 * its primary key: `RelatedModel.find(foreignKeyValue)`.
 *
 * @example
 * ```ts
 * // Post belongs to User
 * const author = await post.belongsTo(User, 'author_id').get();
 * // Reads post.author_id, then: User.find(authorId)
 * ```
 */

import { Observable, of } from 'rxjs';
import { Relation } from './relation';

// ---------------------------------------------------------------------------
// BelongsToRelation
// ---------------------------------------------------------------------------

/**
 * Represents a belongs-to (inverse) relationship between a child and parent model.
 *
 * Reads the foreign key value from the child (parent in Relation terms),
 * then finds the related model by its owner key (typically primary key).
 *
 * @typeParam TParent  - The child Model type (the one holding the foreign key).
 * @typeParam TRelated - The parent/owner Model type.
 *
 * @example
 * ```ts
 * const relation = new BelongsToRelation(post, User, 'author_id', 'id');
 * const author = await relation.get(); // User | null
 * ```
 */
export class BelongsToRelation<TParent = any, TRelated = any> extends Relation<TParent, TRelated> {
  /**
   * The foreign key on the child model (this model).
   * E.g., `'author_id'` on the posts collection.
   */
  private readonly foreignKey: string;

  /**
   * The owner key on the related (parent) model.
   * Typically the primary key (e.g., `'id'`).
   */
  private readonly ownerKey: string;

  /**
   * Create a new BelongsToRelation.
   *
   * @param parent    - The child model instance (holds the foreign key).
   * @param related   - The related (parent) model class.
   * @param foreignKey - The foreign key on the child model.
   * @param ownerKey  - The owner key on the related model.
   */
  constructor(parent: TParent, related: any, foreignKey: string, ownerKey: string) {
    super(parent, related);
    this.foreignKey = foreignKey;
    this.ownerKey = ownerKey;
  }

  /**
   * Resolve the belongs-to relationship.
   *
   * Reads the foreign key value from the child model, then finds the
   * related model: `RelatedModel.find(foreignKeyValue)`.
   *
   * @returns A promise resolving to the related model instance, or `null`.
   *
   * @example
   * ```ts
   * const author = await relation.get();
   * ```
   */
  async get(): Promise<TRelated | null> {
    const foreignKeyValue = this.getForeignKeyValue();
    if (foreignKeyValue === null || foreignKeyValue === undefined) return null;

    const RelatedModel = this.related;
    if (typeof RelatedModel.find === 'function') {
      return RelatedModel.find(foreignKeyValue);
    }
    return null;
  }

  /**
   * Observe live changes to the belongs-to relationship.
   *
   * Returns an Observable that emits the latest related model whenever
   * the underlying data changes. Re-resolves the relationship when the
   * foreign key value changes.
   *
   * @returns An Observable emitting `TRelated | null`.
   *
   * @example
   * ```ts
   * relation.observe().subscribe(author => {
   *   console.log('Author:', author);
   * });
   * ```
   */
  observe(): Observable<TRelated | null> {
    const foreignKeyValue = this.getForeignKeyValue();
    if (foreignKeyValue === null || foreignKeyValue === undefined) return of(null);

    const RelatedModel = this.related;
    if (typeof RelatedModel.query === 'function') {
      return new Observable<TRelated | null>((subscriber) => {
        const sub = RelatedModel.query()
          .where(this.ownerKey, foreignKeyValue)
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
   * Get the owner key name for this relation.
   *
   * @returns The owner key string.
   */
  getOwnerKey(): string {
    return this.ownerKey;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Get the foreign key value from the child model.
   *
   * @returns The foreign key value.
   * @internal
   */
  private getForeignKeyValue(): any {
    const parent = this.parent as any;
    if (typeof parent.getAttribute === 'function') {
      return parent.getAttribute(this.foreignKey);
    }
    return parent[this.foreignKey];
  }
}

/**
 * @file belongs-to-many.relation.ts
 * @description BelongsToMany relationship implementation for the rxdb-eloquent package.
 *
 * Resolves a many-to-many relationship via a pivot (junction) collection.
 * Queries the pivot collection for matching foreign keys, extracts the related
 * keys, then batch-queries the related collection.
 *
 * Provides `attach()`, `detach()`, and `sync()` methods for managing the
 * pivot collection entries.
 *
 * @example
 * ```ts
 * // User belongs to many Roles via user_roles pivot
 * const roles = await user.belongsToMany(Role, 'user_roles', 'user_id', 'role_id').get();
 * // 1. Query: user_roles WHERE user_id = user.id → extract role_ids
 * // 2. Query: roles WHERE id IN [role_ids]
 * ```
 */

import { Observable } from 'rxjs';
import { Relation } from './relation';

// ---------------------------------------------------------------------------
// BelongsToManyRelation
// ---------------------------------------------------------------------------

/**
 * Represents a many-to-many relationship via a pivot collection.
 *
 * Resolution strategy:
 * 1. Query pivot collection: `WHERE foreignPivotKey = parent.primaryKey`
 * 2. Extract `relatedPivotKey` values from pivot documents
 * 3. Query related collection: `WHERE primaryKey IN [relatedPivotKeyValues]`
 *
 * @typeParam TParent  - The parent Model type.
 * @typeParam TRelated - The related Model type.
 *
 * @example
 * ```ts
 * const relation = new BelongsToManyRelation(
 *   user, Role, 'user_roles', 'user_id', 'role_id'
 * );
 * const roles = await relation.get(); // Role[]
 * await relation.attach(['role-1', 'role-2']);
 * await relation.detach(['role-1']);
 * await relation.sync(['role-2', 'role-3']);
 * ```
 */
export class BelongsToManyRelation<TParent = any, TRelated = any> extends Relation<
  TParent,
  TRelated
> {
  /**
   * The name of the pivot (junction) collection.
   * E.g., `'user_roles'`.
   */
  private readonly pivotCollection: string;

  /**
   * The key in the pivot collection referencing the parent model.
   * E.g., `'user_id'`.
   */
  private readonly foreignPivotKey: string;

  /**
   * The key in the pivot collection referencing the related model.
   * E.g., `'role_id'`.
   */
  private readonly relatedPivotKey: string;

  /**
   * Create a new BelongsToManyRelation.
   *
   * @param parent          - The parent model instance.
   * @param related         - The related model class.
   * @param pivotCollection - The pivot collection name.
   * @param foreignPivotKey - The key in pivot referencing the parent.
   * @param relatedPivotKey - The key in pivot referencing the related model.
   */
  constructor(
    parent: TParent,
    related: any,
    pivotCollection: string,
    foreignPivotKey: string,
    relatedPivotKey: string
  ) {
    super(parent, related);
    this.pivotCollection = pivotCollection;
    this.foreignPivotKey = foreignPivotKey;
    this.relatedPivotKey = relatedPivotKey;
  }

  /**
   * Resolve the belongs-to-many relationship.
   *
   * 1. Query pivot collection for entries matching the parent's key
   * 2. Extract related key values from pivot documents
   * 3. Batch-query the related collection with `$in`
   *
   * Note: Pivot queries are complex and will be fully implemented in a
   * future iteration. Currently returns an empty array.
   *
   * @returns A promise resolving to an array of related model instances.
   *
   * @example
   * ```ts
   * const roles = await relation.get();
   * console.log(`User has ${roles.length} roles`);
   * ```
   */
  async get(): Promise<TRelated[]> {
    const parentKeyValue = this.getParentKeyValue();
    if (parentKeyValue === null || parentKeyValue === undefined) return [];

    try {
      const { Model } = await import('../model/model');
      const connName = this.related.getConnectionName?.() ?? 'default';
      const conn = await Model.getConnectionManager().connection(connName);
      const pivotCol = conn.getCollection(this.pivotCollection);

      const pivotDocs = await pivotCol
        .find({
          selector: { [this.foreignPivotKey]: { $eq: parentKeyValue } },
        })
        .exec();

      if (pivotDocs.length === 0) return [];

      const relatedKeys = pivotDocs.map((doc: any) => {
        const data = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
        return data[this.relatedPivotKey];
      });

      const RelatedModel = this.related;
      const relatedPK = RelatedModel.primaryKey ?? 'id';
      return RelatedModel.query().where(relatedPK, 'in', relatedKeys).get();
    } catch (err) {
      return [];
    }
  }

  /**
   * Observe live changes to the belongs-to-many relationship.
   *
   * Note: Pivot queries are complex and will be fully implemented in a
   * future iteration. Currently returns an Observable that emits an empty array.
   *
   * @returns An Observable emitting `TRelated[]`.
   */
  observe(): Observable<TRelated[]> {
    return new Observable<TRelated[]>((subscriber) => {
      let sub: any;
      (async () => {
        try {
          const parentKeyValue = this.getParentKeyValue();
          if (parentKeyValue === null || parentKeyValue === undefined) {
            subscriber.next([]);
            subscriber.complete();
            return;
          }

          const { Model } = await import('../model/model');
          const conn = await Model.getConnectionManager().connection(
            this.related.getConnectionName?.() ?? 'default'
          );
          const pivotCol = conn.getCollection(this.pivotCollection);

          sub = pivotCol
            .find({
              selector: { [this.foreignPivotKey]: { $eq: parentKeyValue } },
            })
            .$.subscribe({
              next: async (pivotDocs: any[]) => {
                if (pivotDocs.length === 0) {
                  subscriber.next([]);
                  return;
                }
                const relatedKeys = pivotDocs.map((doc: any) => {
                  const data = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
                  return data[this.relatedPivotKey];
                });
                const RelatedModel = this.related;
                const relatedPK = RelatedModel.primaryKey ?? 'id';
                const results = await RelatedModel.query()
                  .where(relatedPK, 'in', relatedKeys)
                  .get();
                subscriber.next(results);
              },
              error: (err: any) => subscriber.error(err),
              complete: () => subscriber.complete(),
            });
        } catch (err) {
          subscriber.error(err);
        }
      })();

      return () => {
        if (sub) sub.unsubscribe();
      };
    });
  }

  /**
   * Attach one or more related models by inserting pivot records.
   *
   * Creates entries in the pivot collection linking the parent to the
   * specified related model IDs.
   *
   * Note: Pivot collection operations will be fully implemented in a
   * future iteration.
   *
   * @param ids - A single ID or array of IDs to attach.
   *
   * @example
   * ```ts
   * await relation.attach('role-1');
   * await relation.attach(['role-2', 'role-3']);
   * ```
   */
  async attach(ids: string | string[]): Promise<void> {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    const parentKeyValue = this.getParentKeyValue();

    const { Model } = await import('../model/model');
    const conn = await Model.getConnectionManager().connection(
      this.related.getConnectionName?.() ?? 'default'
    );
    const pivotCol = conn.getCollection(this.pivotCollection);

    for (const id of idsArray) {
      await pivotCol.insert({
        id: `${parentKeyValue}_${id}`,
        [this.foreignPivotKey]: parentKeyValue,
        [this.relatedPivotKey]: id,
      });
    }
  }

  /**
   * Detach one or more related models by removing pivot records.
   *
   * If no IDs are provided, detaches all related models.
   *
   * Note: Pivot collection operations will be fully implemented in a
   * future iteration.
   *
   * @param ids - Optional ID(s) to detach. If omitted, detaches all.
   *
   * @example
   * ```ts
   * await relation.detach('role-1');       // Detach specific
   * await relation.detach(['role-1']);      // Detach specific (array)
   * await relation.detach();               // Detach all
   * ```
   */
  async detach(ids?: string | string[]): Promise<void> {
    const parentKeyValue = this.getParentKeyValue();

    const { Model } = await import('../model/model');
    const conn = await Model.getConnectionManager().connection(
      this.related.getConnectionName?.() ?? 'default'
    );
    const pivotCol = conn.getCollection(this.pivotCollection);

    const selector: Record<string, any> = {
      [this.foreignPivotKey]: { $eq: parentKeyValue },
    };

    if (ids !== undefined) {
      const idsArray = Array.isArray(ids) ? ids : [ids];
      selector[this.relatedPivotKey] = { $in: idsArray };
    }

    const pivotDocs = await pivotCol.find({ selector }).exec();
    for (const doc of pivotDocs) {
      await doc.remove();
    }
  }

  /**
   * Sync the pivot collection to match exactly the given IDs.
   *
   * Detaches any related models not in the provided list, and attaches
   * any that are missing. After sync, the pivot collection will contain
   * exactly the specified relationships.
   *
   * Note: Pivot collection operations will be fully implemented in a
   * future iteration.
   *
   * @param ids - The complete list of related model IDs that should be attached.
   *
   * @example
   * ```ts
   * await relation.sync(['role-1', 'role-3']);
   * // After: only role-1 and role-3 are attached
   * ```
   */
  async sync(ids: string[]): Promise<void> {
    const parentKeyValue = this.getParentKeyValue();

    const { Model } = await import('../model/model');
    const conn = await Model.getConnectionManager().connection(
      this.related.getConnectionName?.() ?? 'default'
    );
    const pivotCol = conn.getCollection(this.pivotCollection);

    const currentDocs = await pivotCol
      .find({
        selector: { [this.foreignPivotKey]: { $eq: parentKeyValue } },
      })
      .exec();

    const currentIds = new Set(
      currentDocs.map((doc: any) => {
        const data = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
        return data[this.relatedPivotKey];
      })
    );

    const desiredIds = new Set(ids);

    // Detach extras
    for (const doc of currentDocs) {
      const data = typeof doc.toJSON === 'function' ? doc.toJSON() : doc;
      if (!desiredIds.has(data[this.relatedPivotKey])) {
        await doc.remove();
      }
    }

    // Attach missing
    for (const id of ids) {
      if (!currentIds.has(id)) {
        await pivotCol.insert({
          id: `${parentKeyValue}_${id}`,
          [this.foreignPivotKey]: parentKeyValue,
          [this.relatedPivotKey]: id,
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Accessors
  // -------------------------------------------------------------------------

  /**
   * Get the pivot collection name.
   *
   * @returns The pivot collection name string.
   */
  getPivotCollection(): string {
    return this.pivotCollection;
  }

  /**
   * Get the foreign pivot key name.
   *
   * @returns The foreign pivot key string.
   */
  getForeignPivotKey(): string {
    return this.foreignPivotKey;
  }

  /**
   * Get the related pivot key name.
   *
   * @returns The related pivot key string.
   */
  getRelatedPivotKey(): string {
    return this.relatedPivotKey;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Get the parent model's primary key value.
   *
   * @returns The parent's key value.
   * @internal
   */
  private getParentKeyValue(): any {
    const parent = this.parent as any;
    const primaryKey = parent.constructor?.primaryKey ?? 'id';
    if (typeof parent.getAttribute === 'function') {
      return parent.getAttribute(primaryKey);
    }
    return parent[primaryKey];
  }
}

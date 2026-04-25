/**
 * @file has-relationships.concern.ts
 * @description Mixin/concern that provides relationship definition and resolution
 * for Model instances.
 *
 * Provides `hasOne()`, `hasMany()`, `belongsTo()`, and `belongsToMany()` methods
 * that create Relation instances. Reads `@HasOne`, `@HasMany`, `@BelongsTo`, and
 * `@BelongsToMany` metadata from MetadataStorage to support decorator-defined
 * relations.
 *
 * Factory functions (`() => Model`) are lazily resolved when the relation is
 * first accessed, avoiding circular dependency issues between Model classes.
 *
 * @example
 * ```ts
 * class User extends HasRelationships(BaseClass) {
 *   @HasMany(() => Post, 'author_id')
 *   declare posts: Post[];
 *
 *   @HasOne(() => Profile, 'user_id')
 *   declare profile: Profile;
 *
 *   @BelongsToMany(() => Role, 'user_roles', 'user_id', 'role_id')
 *   declare roles: Role[];
 * }
 * ```
 */

import { Str } from '@stackra/ts-support';
import { MetadataStorage } from '@/metadata/metadata.storage';
import type { RelationMetadata } from '@/metadata/metadata.storage';
import { HasOneRelation } from '@/relations/has-one.relation';
import { HasManyRelation } from '@/relations/has-many.relation';
import { BelongsToRelation } from '@/relations/belongs-to.relation';
import { BelongsToManyRelation } from '@/relations/belongs-to-many.relation';
import type { Relation } from '@/relations/relation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Interface for the HasRelationships concern.
 *
 * Defines the contract for relationship definition on Model instances.
 */
export interface HasRelationshipsInterface {
  /** Define a has-one relationship. */
  hasOne(related: any, foreignKey?: string, localKey?: string): any;
  /** Define a has-many relationship. */
  hasMany(related: any, foreignKey?: string, localKey?: string): any;
  /** Define a belongs-to relationship. */
  belongsTo(related: any, foreignKey?: string, ownerKey?: string): any;
  /** Define a belongs-to-many relationship. */
  belongsToMany(
    related: any,
    pivotCollection?: string,
    foreignPivotKey?: string,
    relatedPivotKey?: string
  ): any;
  /** Get a relation instance by property name (reads decorator metadata). */
  getRelation(name: string): Relation<any, any> | undefined;
}

// ---------------------------------------------------------------------------
// HasRelationships Mixin
// ---------------------------------------------------------------------------

/**
 * Mixin function that adds relationship definition and resolution to a base class.
 *
 * Provides `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`, and `getRelation`
 * methods. Reads relation metadata from MetadataStorage for decorator-defined
 * relations and lazily resolves factory functions.
 *
 * @param Base - The base class to extend.
 *               TODO: Replace `any` with proper Model base type once available.
 * @returns A new class extending Base with HasRelationships functionality.
 *
 * @example
 * ```ts
 * class User extends HasRelationships(BaseClass) {
 *   getPostsRelation() {
 *     return this.hasMany(Post, 'author_id');
 *   }
 * }
 * ```
 */
export function HasRelationships<TBase extends new (...args: any[]) => any>(Base: TBase) {
  return class HasRelationshipsMixin extends Base implements HasRelationshipsInterface {
    /**
     * Cache of resolved relation instances, keyed by relation property name.
     * @internal
     */
    _relations: Map<string, Relation<any, any>> = new Map();

    /**
     * Define a has-one relationship.
     *
     * The related model's collection is queried with:
     * `WHERE foreignKey = this[localKey]`
     *
     * @param related    - The related Model class (or factory function).
     * @param foreignKey - The foreign key on the related model's collection.
     * @param localKey   - The local key on this model (defaults to primary key).
     * @returns A HasOneRelation instance.
     *
     * @example
     * ```ts
     * // In a User model:
     * getProfile() {
     *   return this.hasOne(Profile, 'user_id');
     * }
     * ```
     */
    hasOne(related: any, foreignKey?: string, localKey?: string): HasOneRelation<any, any> {
      const resolvedRelated =
        typeof related === 'function' && !related.prototype ? related() : related;
      const fk = foreignKey ?? `${this._guessModelName()}_id`;
      const lk = localKey ?? this._getPrimaryKeyName();

      return new HasOneRelation(this as any, resolvedRelated, fk, lk);
    }

    /**
     * Define a has-many relationship.
     *
     * The related model's collection is queried with:
     * `WHERE foreignKey = this[localKey]`
     *
     * @param related    - The related Model class (or factory function).
     * @param foreignKey - The foreign key on the related model's collection.
     * @param localKey   - The local key on this model (defaults to primary key).
     * @returns A HasManyRelation instance.
     *
     * @example
     * ```ts
     * // In a User model:
     * getPosts() {
     *   return this.hasMany(Post, 'author_id');
     * }
     * ```
     */
    hasMany(related: any, foreignKey?: string, localKey?: string): HasManyRelation<any, any> {
      const resolvedRelated =
        typeof related === 'function' && !related.prototype ? related() : related;
      const fk = foreignKey ?? `${this._guessModelName()}_id`;
      const lk = localKey ?? this._getPrimaryKeyName();

      return new HasManyRelation(this as any, resolvedRelated, fk, lk);
    }

    /**
     * Define a belongs-to relationship.
     *
     * Looks up the foreign key value on this model, then finds the related
     * model by its primary key (ownerKey).
     *
     * @param related    - The related Model class (or factory function).
     * @param foreignKey - The foreign key on this model.
     * @param ownerKey   - The key on the related model (defaults to its primary key).
     * @returns A BelongsToRelation instance.
     *
     * @example
     * ```ts
     * // In a Post model:
     * getAuthor() {
     *   return this.belongsTo(User, 'author_id');
     * }
     * ```
     */
    belongsTo(related: any, foreignKey?: string, ownerKey?: string): BelongsToRelation<any, any> {
      const resolvedRelated =
        typeof related === 'function' && !related.prototype ? related() : related;
      const fk = foreignKey ?? `${this._guessRelatedModelName(resolvedRelated)}_id`;
      const ok = ownerKey ?? 'id';

      return new BelongsToRelation(this as any, resolvedRelated, fk, ok);
    }

    /**
     * Define a belongs-to-many relationship (many-to-many via pivot collection).
     *
     * Queries a pivot collection to find related model IDs, then batch-queries
     * the related collection.
     *
     * @param related         - The related Model class (or factory function).
     * @param pivotCollection - The name of the pivot/junction collection.
     * @param foreignPivotKey - The key in the pivot collection referencing this model.
     * @param relatedPivotKey - The key in the pivot collection referencing the related model.
     * @returns A BelongsToManyRelation instance.
     *
     * @example
     * ```ts
     * // In a User model:
     * getRoles() {
     *   return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
     * }
     * ```
     */
    belongsToMany(
      related: any,
      pivotCollection?: string,
      foreignPivotKey?: string,
      relatedPivotKey?: string
    ): BelongsToManyRelation<any, any> {
      const resolvedRelated =
        typeof related === 'function' && !related.prototype ? related() : related;
      const pivot = pivotCollection ?? '';
      const fpk = foreignPivotKey ?? `${this._guessModelName()}_id`;
      const rpk = relatedPivotKey ?? `${this._guessRelatedModelName(resolvedRelated)}_id`;

      return new BelongsToManyRelation(this as any, resolvedRelated, pivot, fpk, rpk);
    }

    /**
     * Get a relation instance by property name.
     *
     * Reads `@HasOne`, `@HasMany`, `@BelongsTo`, `@BelongsToMany` metadata
     * from MetadataStorage and lazily creates the corresponding Relation instance.
     * Results are cached for the lifetime of this model instance.
     *
     * @param name - The property name of the relation (as declared on the class).
     * @returns The Relation instance, or `undefined` if no relation metadata exists.
     *
     * @example
     * ```ts
     * const postsRelation = user.getRelation('posts');
     * if (postsRelation) {
     *   const posts = await postsRelation.get();
     * }
     * ```
     */
    getRelation(name: string): Relation<any, any> | undefined {
      // Check cache first
      if (this._relations.has(name)) {
        return this._relations.get(name)!;
      }

      // Look up relation metadata
      const storage = MetadataStorage.getInstance();
      const relations = storage.getMergedRelations(this.constructor);
      const meta = relations.get(name);

      if (!meta) {
        return undefined;
      }

      // Lazily resolve the factory function and create the relation
      const relation = this._createRelationFromMetadata(meta);
      this._relations.set(name, relation);
      return relation;
    }

    // -----------------------------------------------------------------------
    // Private Helpers
    // -----------------------------------------------------------------------

    /**
     * Create a Relation instance from RelationMetadata.
     *
     * Resolves the factory function to get the related Model class, then
     * creates the appropriate Relation subclass.
     *
     * @param meta - The relation metadata from MetadataStorage.
     * @returns A Relation instance.
     * @internal
     */
    _createRelationFromMetadata(meta: RelationMetadata): Relation<any, any> {
      // Resolve the factory function to get the related Model class
      const relatedClass =
        typeof meta.relatedFactory === 'function' ? meta.relatedFactory() : meta.relatedFactory;

      switch (meta.type) {
        case 'hasOne':
          return new HasOneRelation(
            this as any,
            relatedClass,
            meta.foreignKey,
            meta.localKey ?? this._getPrimaryKeyName()
          );

        case 'hasMany':
          return new HasManyRelation(
            this as any,
            relatedClass,
            meta.foreignKey,
            meta.localKey ?? this._getPrimaryKeyName()
          );

        case 'belongsTo':
          return new BelongsToRelation(
            this as any,
            relatedClass,
            meta.foreignKey,
            meta.ownerKey ?? 'id'
          );

        case 'belongsToMany':
          return new BelongsToManyRelation(
            this as any,
            relatedClass,
            meta.pivotCollection ?? '',
            meta.foreignPivotKey ?? meta.foreignKey,
            meta.relatedPivotKey ?? ''
          );

        default:
          throw new Error(`Unknown relation type: ${(meta as any).type}`);
      }
    }

    /**
     * Guess the model name in snake_case for default foreign key generation.
     *
     * @returns The lowercase model name (e.g., 'user' for class User).
     * @internal
     */
    _guessModelName(): string {
      return Str.lower(this.constructor.name);
    }

    /**
     * Guess the related model name in snake_case for default foreign key generation.
     *
     * @param related - The related Model class.
     * @returns The lowercase model name.
     * @internal
     */
    _guessRelatedModelName(related: any): string {
      return Str.lower(related?.name ?? 'related');
    }

    /**
     * Get the primary key field name for this model.
     *
     * @returns The primary key field name.
     * @internal
     */
    _getPrimaryKeyName(): string {
      return (this.constructor as any).primaryKey ?? 'id';
    }
  };
}

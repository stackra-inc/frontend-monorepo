/**
 * @file has-relationships.test.ts
 * @description Unit tests for the HasRelationships mixin. Verifies that hasOne,
 * hasMany, belongsTo, and belongsToMany return the correct Relation subclass
 * instances, and that getRelation reads from MetadataStorage correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HasRelationships } from '@/model/concerns/has-relationships.concern';
import { HasOneRelation } from '@/relations/has-one.relation';
import { HasManyRelation } from '@/relations/has-many.relation';
import { BelongsToRelation } from '@/relations/belongs-to.relation';
import { BelongsToManyRelation } from '@/relations/belongs-to-many.relation';
import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** Minimal base class for the mixin. */
class Base {
  static primaryKey = 'id';
  id = '1';

  getAttribute(key: string): any {
    return (this as any)[key];
  }
}

/** Apply the HasRelationships mixin. */
const WithRelationships = HasRelationships(Base);

/** Fake related model class. */
class Post {
  static primaryKey = 'id';
}

/** Fake related model class. */
class Profile {
  static primaryKey = 'id';
}

/** Fake related model class for many-to-many. */
class Role {
  static primaryKey = 'id';
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HasRelationships', () => {
  beforeEach(() => {
    MetadataStorage.getInstance().clear();
  });

  // -------------------------------------------------------------------------
  // hasOne()
  // -------------------------------------------------------------------------

  it('hasOne(Related, foreignKey) returns a HasOneRelation', () => {
    const instance = new WithRelationships();
    const relation = instance.hasOne(Profile, 'user_id');

    expect(relation).toBeInstanceOf(HasOneRelation);
  });

  // -------------------------------------------------------------------------
  // hasMany()
  // -------------------------------------------------------------------------

  it('hasMany(Related, foreignKey) returns a HasManyRelation', () => {
    const instance = new WithRelationships();
    const relation = instance.hasMany(Post, 'author_id');

    expect(relation).toBeInstanceOf(HasManyRelation);
  });

  // -------------------------------------------------------------------------
  // belongsTo()
  // -------------------------------------------------------------------------

  it('belongsTo(Related, foreignKey) returns a BelongsToRelation', () => {
    const instance = new WithRelationships();
    const relation = instance.belongsTo(Post, 'post_id');

    expect(relation).toBeInstanceOf(BelongsToRelation);
  });

  // -------------------------------------------------------------------------
  // belongsToMany()
  // -------------------------------------------------------------------------

  it('belongsToMany(Related, pivot, fpk, rpk) returns a BelongsToManyRelation', () => {
    const instance = new WithRelationships();
    const relation = instance.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');

    expect(relation).toBeInstanceOf(BelongsToManyRelation);
  });

  // -------------------------------------------------------------------------
  // getRelation() — reads from MetadataStorage
  // -------------------------------------------------------------------------

  it('getRelation("posts") reads from MetadataStorage and returns the correct relation type', () => {
    const storage = MetadataStorage.getInstance();

    // Register a hasMany relation for 'posts' on the mixin class
    storage.registerRelation(WithRelationships, {
      propertyKey: 'posts',
      type: 'hasMany',
      relatedFactory: () => Post,
      foreignKey: 'author_id',
    });

    const instance = new WithRelationships();
    const relation = instance.getRelation('posts');

    expect(relation).toBeInstanceOf(HasManyRelation);
  });

  it('getRelation() returns undefined for unregistered relation names', () => {
    const instance = new WithRelationships();
    const relation = instance.getRelation('nonexistent');

    expect(relation).toBeUndefined();
  });
});

/**
 * @file relation-decorators.test.ts
 * @description Unit tests for all relation decorators: @HasOne, @HasMany,
 * @BelongsTo, and @BelongsToMany.
 *
 * Each test applies a relation decorator to a class property and verifies that
 * the correct relation metadata (type, foreignKey, pivot info, factory function)
 * is stored in MetadataStorage. Also tests that the relatedFactory is a deferred
 * function rather than the class directly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { HasOne } from '@/decorators/has-one.decorator';
import { HasMany } from '@/decorators/has-many.decorator';
import { BelongsTo } from '@/decorators/belongs-to.decorator';
import { BelongsToMany } from '@/decorators/belongs-to-many.decorator';

let storage: MetadataStorage;

class MockRelated {}

beforeEach(() => {
  storage = MetadataStorage.getInstance();
  storage.clear();
});

// ---------------------------------------------------------------------------
// @HasOne
// ---------------------------------------------------------------------------

describe('@HasOne decorator', () => {
  it('registers a hasOne relation with the correct foreignKey', () => {
    class User {
      @HasOne(() => MockRelated, 'user_id')
      declare profile: any;
    }

    const relations = storage.getRelations(User);
    expect(relations.size).toBe(1);

    const rel = relations.get('profile')!;
    expect(rel.propertyKey).toBe('profile');
    expect(rel.type).toBe('hasOne');
    expect(rel.foreignKey).toBe('user_id');
  });
});

// ---------------------------------------------------------------------------
// @HasMany
// ---------------------------------------------------------------------------

describe('@HasMany decorator', () => {
  it('registers a hasMany relation with the correct foreignKey', () => {
    class User {
      @HasMany(() => MockRelated, 'author_id')
      declare posts: any[];
    }

    const relations = storage.getRelations(User);
    expect(relations.size).toBe(1);

    const rel = relations.get('posts')!;
    expect(rel.propertyKey).toBe('posts');
    expect(rel.type).toBe('hasMany');
    expect(rel.foreignKey).toBe('author_id');
  });
});

// ---------------------------------------------------------------------------
// @BelongsTo
// ---------------------------------------------------------------------------

describe('@BelongsTo decorator', () => {
  it('registers a belongsTo relation with the correct foreignKey', () => {
    class Post {
      @BelongsTo(() => MockRelated, 'user_id')
      declare author: any;
    }

    const relations = storage.getRelations(Post);
    expect(relations.size).toBe(1);

    const rel = relations.get('author')!;
    expect(rel.propertyKey).toBe('author');
    expect(rel.type).toBe('belongsTo');
    expect(rel.foreignKey).toBe('user_id');
  });
});

// ---------------------------------------------------------------------------
// @BelongsToMany
// ---------------------------------------------------------------------------

describe('@BelongsToMany decorator', () => {
  it('registers a belongsToMany relation with pivot info', () => {
    class User {
      @BelongsToMany(() => MockRelated, 'user_roles', 'user_id', 'role_id')
      declare roles: any[];
    }

    const relations = storage.getRelations(User);
    expect(relations.size).toBe(1);

    const rel = relations.get('roles')!;
    expect(rel.propertyKey).toBe('roles');
    expect(rel.type).toBe('belongsToMany');
    expect(rel.pivotCollection).toBe('user_roles');
    expect(rel.foreignPivotKey).toBe('user_id');
    expect(rel.relatedPivotKey).toBe('role_id');
  });
});

// ---------------------------------------------------------------------------
// Factory function deferred resolution
// ---------------------------------------------------------------------------

describe('Relation factory function deferred resolution', () => {
  it('relatedFactory is a function that returns the related class, not the class directly', () => {
    class User {
      @HasOne(() => MockRelated, 'user_id')
      declare profile: any;
    }

    const rel = storage.getRelations(User).get('profile')!;
    expect(typeof rel.relatedFactory).toBe('function');
    expect(rel.relatedFactory()).toBe(MockRelated);
  });
});

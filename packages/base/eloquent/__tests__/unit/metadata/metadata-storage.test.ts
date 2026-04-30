/**
 * @file metadata-storage.test.ts
 * @description Unit tests for the MetadataStorage singleton registry.
 *
 * Verifies that MetadataStorage correctly stores and retrieves all decorator
 * metadata: columns, column flags, class metadata, relations, scopes, hooks,
 * accessor/mutators, and convenience field-set helpers (fillable, guarded,
 * hidden, visible, casts). Also tests inheritance merging via getMerged* methods.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataStorage } from '@/metadata/metadata.storage';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

class ParentModel {}
class ChildModel extends ParentModel {}

let storage: MetadataStorage;

beforeEach(() => {
  storage = MetadataStorage.getInstance();
  storage.clear();
});

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

describe('MetadataStorage — Singleton', () => {
  it('getInstance() returns the same instance on consecutive calls', () => {
    const a = MetadataStorage.getInstance();
    const b = MetadataStorage.getInstance();
    expect(a).toBe(b);
  });
});

// ---------------------------------------------------------------------------
// clear()
// ---------------------------------------------------------------------------

describe('MetadataStorage — clear()', () => {
  it('resets all internal maps so no metadata is returned', () => {
    class Tmp {}
    storage.registerColumn(Tmp, 'name', { type: 'string' });
    storage.registerClassMetadata(Tmp, 'collection', 'tmp');
    storage.registerRelation(Tmp, {
      propertyKey: 'rel',
      type: 'hasOne',
      relatedFactory: () => Tmp,
      foreignKey: 'tmp_id',
    });
    storage.registerScope(Tmp, { methodName: 'scopeActive', type: 'local' });
    storage.registerHook(Tmp, { methodName: 'onBefore', event: 'beforeCreate' });
    storage.registerAccessorMutator(Tmp, {
      methodName: 'getFoo',
      fieldName: 'foo',
      type: 'accessor',
    });

    storage.clear();

    expect(storage.getColumns(Tmp).size).toBe(0);
    expect(storage.getClassMetadata(Tmp).collection).toBeUndefined();
    expect(storage.getRelations(Tmp).size).toBe(0);
    expect(storage.getScopes(Tmp).size).toBe(0);
    expect(storage.getHooks(Tmp)).toHaveLength(0);
    expect(storage.getAccessorsMutators(Tmp)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// registerColumn / getColumns
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerColumn / getColumns', () => {
  it('registers a column and retrieves it with correct options', () => {
    class User {}
    storage.registerColumn(User, 'name', { type: 'string', maxLength: 100 });

    const columns = storage.getColumns(User);
    expect(columns.size).toBe(1);

    const col = columns.get('name')!;
    expect(col.propertyKey).toBe('name');
    expect(col.options.type).toBe('string');
    expect(col.options.maxLength).toBe(100);
    expect(col.isPrimary).toBe(false);
    expect(col.isFillable).toBe(false);
    expect(col.isGuarded).toBe(false);
    expect(col.isHidden).toBe(false);
    expect(col.isVisible).toBe(false);
    expect(col.isIndex).toBe(false);
    expect(col.isFinal).toBe(false);
    expect(col.castType).toBeUndefined();
    expect(col.defaultValue).toBeUndefined();
    expect(col.ref).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// registerColumnFlag
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerColumnFlag', () => {
  it('sets isPrimary flag', () => {
    class M {}
    storage.registerColumn(M, 'id', { type: 'string' });
    storage.registerColumnFlag(M, 'id', 'isPrimary', true);
    expect(storage.getColumns(M).get('id')!.isPrimary).toBe(true);
  });

  it('sets isFillable flag', () => {
    class M {}
    storage.registerColumn(M, 'name', { type: 'string' });
    storage.registerColumnFlag(M, 'name', 'isFillable', true);
    expect(storage.getColumns(M).get('name')!.isFillable).toBe(true);
  });

  it('sets isGuarded flag', () => {
    class M {}
    storage.registerColumn(M, 'role', { type: 'string' });
    storage.registerColumnFlag(M, 'role', 'isGuarded', true);
    expect(storage.getColumns(M).get('role')!.isGuarded).toBe(true);
  });

  it('sets isHidden flag', () => {
    class M {}
    storage.registerColumn(M, 'password', { type: 'string' });
    storage.registerColumnFlag(M, 'password', 'isHidden', true);
    expect(storage.getColumns(M).get('password')!.isHidden).toBe(true);
  });

  it('sets isVisible flag', () => {
    class M {}
    storage.registerColumn(M, 'email', { type: 'string' });
    storage.registerColumnFlag(M, 'email', 'isVisible', true);
    expect(storage.getColumns(M).get('email')!.isVisible).toBe(true);
  });

  it('sets isIndex flag', () => {
    class M {}
    storage.registerColumn(M, 'email', { type: 'string' });
    storage.registerColumnFlag(M, 'email', 'isIndex', true);
    expect(storage.getColumns(M).get('email')!.isIndex).toBe(true);
  });

  it('sets isFinal flag', () => {
    class M {}
    storage.registerColumn(M, 'slug', { type: 'string' });
    storage.registerColumnFlag(M, 'slug', 'isFinal', true);
    expect(storage.getColumns(M).get('slug')!.isFinal).toBe(true);
  });

  it('sets castType', () => {
    class M {}
    storage.registerColumn(M, 'createdAt', { type: 'string' });
    storage.registerColumnFlag(M, 'createdAt', 'castType', 'date');
    expect(storage.getColumns(M).get('createdAt')!.castType).toBe('date');
  });

  it('sets defaultValue', () => {
    class M {}
    storage.registerColumn(M, 'status', { type: 'string' });
    storage.registerColumnFlag(M, 'status', 'defaultValue', 'active');
    expect(storage.getColumns(M).get('status')!.defaultValue).toBe('active');
  });

  it('sets ref', () => {
    class M {}
    storage.registerColumn(M, 'profile_id', { type: 'string' });
    storage.registerColumnFlag(M, 'profile_id', 'ref', 'profiles');
    expect(storage.getColumns(M).get('profile_id')!.ref).toBe('profiles');
  });
});

// ---------------------------------------------------------------------------
// registerColumnFlag BEFORE registerColumn
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerColumnFlag before registerColumn', () => {
  it('preserves flags set before @Column runs', () => {
    class M {}
    // Flag decorators run first (bottom-up in TypeScript)
    storage.registerColumnFlag(M, 'email', 'isFillable', true);
    storage.registerColumnFlag(M, 'email', 'isIndex', true);

    // Then @Column runs
    storage.registerColumn(M, 'email', { type: 'string', maxLength: 255 });

    const col = storage.getColumns(M).get('email')!;
    expect(col.isFillable).toBe(true);
    expect(col.isIndex).toBe(true);
    expect(col.options.type).toBe('string');
    expect(col.options.maxLength).toBe(255);
  });
});

// ---------------------------------------------------------------------------
// registerClassMetadata
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerClassMetadata', () => {
  it('sets collection, connection, timestamps, and softDeletes', () => {
    class M {}
    storage.registerClassMetadata(M, 'collection', 'users');
    storage.registerClassMetadata(M, 'connection', 'remote');
    storage.registerClassMetadata(M, 'timestamps', true);
    storage.registerClassMetadata(M, 'softDeletes', true);

    const meta = storage.getClassMetadata(M);
    expect(meta.collection).toBe('users');
    expect(meta.connection).toBe('remote');
    expect(meta.timestamps).toBe(true);
    expect(meta.softDeletes).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// registerRelation / getRelations
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerRelation / getRelations', () => {
  it('registers hasOne, hasMany, belongsTo, and belongsToMany relations', () => {
    class User {}
    class Profile {}
    class Post {}
    class Role {}

    storage.registerRelation(User, {
      propertyKey: 'profile',
      type: 'hasOne',
      relatedFactory: () => Profile,
      foreignKey: 'user_id',
    });
    storage.registerRelation(User, {
      propertyKey: 'posts',
      type: 'hasMany',
      relatedFactory: () => Post,
      foreignKey: 'author_id',
    });
    storage.registerRelation(User, {
      propertyKey: 'team',
      type: 'belongsTo',
      relatedFactory: () => User,
      foreignKey: 'team_id',
    });
    storage.registerRelation(User, {
      propertyKey: 'roles',
      type: 'belongsToMany',
      relatedFactory: () => Role,
      foreignKey: 'user_id',
      pivotCollection: 'user_roles',
      foreignPivotKey: 'user_id',
      relatedPivotKey: 'role_id',
    });

    const relations = storage.getRelations(User);
    expect(relations.size).toBe(4);
    expect(relations.get('profile')!.type).toBe('hasOne');
    expect(relations.get('posts')!.type).toBe('hasMany');
    expect(relations.get('team')!.type).toBe('belongsTo');
    expect(relations.get('roles')!.type).toBe('belongsToMany');
    expect(relations.get('roles')!.pivotCollection).toBe('user_roles');
  });
});

// ---------------------------------------------------------------------------
// registerScope / getScopes
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerScope / getScopes', () => {
  it('registers local and global scopes', () => {
    class M {}
    storage.registerScope(M, { methodName: 'scopeActive', type: 'local' });
    storage.registerScope(M, { methodName: 'scopeVerified', type: 'global', name: 'verified' });

    const scopes = storage.getScopes(M);
    expect(scopes.size).toBe(2);
    expect(scopes.get('scopeActive')!.type).toBe('local');
    expect(scopes.get('scopeVerified')!.type).toBe('global');
    expect(scopes.get('scopeVerified')!.name).toBe('verified');
  });
});

// ---------------------------------------------------------------------------
// registerHook / getHooks
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerHook / getHooks', () => {
  it('registers beforeCreate, afterCreate, and other lifecycle hooks', () => {
    class M {}
    storage.registerHook(M, { methodName: 'onBeforeCreate', event: 'beforeCreate' });
    storage.registerHook(M, { methodName: 'onAfterCreate', event: 'afterCreate' });
    storage.registerHook(M, { methodName: 'onBeforeUpdate', event: 'beforeUpdate' });
    storage.registerHook(M, { methodName: 'onAfterUpdate', event: 'afterUpdate' });
    storage.registerHook(M, { methodName: 'onBeforeDelete', event: 'beforeDelete' });
    storage.registerHook(M, { methodName: 'onAfterDelete', event: 'afterDelete' });

    const hooks = storage.getHooks(M);
    expect(hooks).toHaveLength(6);
    expect(hooks[0]!.event).toBe('beforeCreate');
    expect(hooks[1]!.event).toBe('afterCreate');
    expect(hooks[5]!.event).toBe('afterDelete');
  });
});

// ---------------------------------------------------------------------------
// registerAccessorMutator / getAccessorsMutators
// ---------------------------------------------------------------------------

describe('MetadataStorage — registerAccessorMutator / getAccessorsMutators', () => {
  it('registers accessor and mutator entries', () => {
    class M {}
    storage.registerAccessorMutator(M, {
      methodName: 'getFullName',
      fieldName: 'fullName',
      type: 'accessor',
    });
    storage.registerAccessorMutator(M, {
      methodName: 'setPassword',
      fieldName: 'password',
      type: 'mutator',
    });

    const entries = storage.getAccessorsMutators(M);
    expect(entries).toHaveLength(2);
    expect(entries[0]!.type).toBe('accessor');
    expect(entries[0]!.fieldName).toBe('fullName');
    expect(entries[1]!.type).toBe('mutator');
    expect(entries[1]!.fieldName).toBe('password');
  });
});

// ---------------------------------------------------------------------------
// Convenience field-set helpers
// ---------------------------------------------------------------------------

describe('MetadataStorage — getFillableFields', () => {
  it('returns only fields marked isFillable', () => {
    class M {}
    storage.registerColumn(M, 'name', { type: 'string' });
    storage.registerColumnFlag(M, 'name', 'isFillable', true);
    storage.registerColumn(M, 'role', { type: 'string' });
    storage.registerColumnFlag(M, 'role', 'isGuarded', true);

    const fillable = storage.getFillableFields(M);
    expect(fillable.size).toBe(1);
    expect(fillable.has('name')).toBe(true);
    expect(fillable.has('role')).toBe(false);
  });
});

describe('MetadataStorage — getGuardedFields', () => {
  it('returns only fields marked isGuarded', () => {
    class M {}
    storage.registerColumn(M, 'name', { type: 'string' });
    storage.registerColumnFlag(M, 'name', 'isFillable', true);
    storage.registerColumn(M, 'role', { type: 'string' });
    storage.registerColumnFlag(M, 'role', 'isGuarded', true);

    const guarded = storage.getGuardedFields(M);
    expect(guarded.size).toBe(1);
    expect(guarded.has('role')).toBe(true);
    expect(guarded.has('name')).toBe(false);
  });
});

describe('MetadataStorage — getHiddenFields', () => {
  it('returns only fields marked isHidden', () => {
    class M {}
    storage.registerColumn(M, 'email', { type: 'string' });
    storage.registerColumn(M, 'password', { type: 'string' });
    storage.registerColumnFlag(M, 'password', 'isHidden', true);

    const hidden = storage.getHiddenFields(M);
    expect(hidden.size).toBe(1);
    expect(hidden.has('password')).toBe(true);
  });
});

describe('MetadataStorage — getVisibleFields', () => {
  it('returns only fields marked isVisible', () => {
    class M {}
    storage.registerColumn(M, 'name', { type: 'string' });
    storage.registerColumnFlag(M, 'name', 'isVisible', true);
    storage.registerColumn(M, 'secret', { type: 'string' });

    const visible = storage.getVisibleFields(M);
    expect(visible.size).toBe(1);
    expect(visible.has('name')).toBe(true);
  });
});

describe('MetadataStorage — getCasts', () => {
  it('returns a map of field → castType for columns with a cast', () => {
    class M {}
    storage.registerColumn(M, 'createdAt', { type: 'string' });
    storage.registerColumnFlag(M, 'createdAt', 'castType', 'date');
    storage.registerColumn(M, 'age', { type: 'integer' });
    storage.registerColumnFlag(M, 'age', 'castType', 'integer');
    storage.registerColumn(M, 'name', { type: 'string' });

    const casts = storage.getCasts(M);
    expect(casts.size).toBe(2);
    expect(casts.get('createdAt')).toBe('date');
    expect(casts.get('age')).toBe('integer');
    expect(casts.has('name')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Inheritance — getMergedColumns
// ---------------------------------------------------------------------------

describe('MetadataStorage — Inheritance — getMergedColumns', () => {
  it('child class inherits parent columns', () => {
    storage.registerColumn(ParentModel, 'id', { type: 'string' });
    storage.registerColumn(ParentModel, 'name', { type: 'string' });
    storage.registerColumn(ChildModel, 'age', { type: 'integer' });

    const merged = storage.getMergedColumns(ChildModel);
    expect(merged.size).toBe(3);
    expect(merged.has('id')).toBe(true);
    expect(merged.has('name')).toBe(true);
    expect(merged.has('age')).toBe(true);
  });

  it('child overrides parent column for the same key', () => {
    storage.registerColumn(ParentModel, 'name', { type: 'string', maxLength: 100 });
    storage.registerColumn(ChildModel, 'name', { type: 'string', maxLength: 255 });

    const merged = storage.getMergedColumns(ChildModel);
    expect(merged.get('name')!.options.maxLength).toBe(255);
  });
});

// ---------------------------------------------------------------------------
// Inheritance — getMergedClassMetadata
// ---------------------------------------------------------------------------

describe('MetadataStorage — Inheritance — getMergedClassMetadata', () => {
  it('child overrides parent collection and connection', () => {
    storage.registerClassMetadata(ParentModel, 'collection', 'parents');
    storage.registerClassMetadata(ParentModel, 'connection', 'default');
    storage.registerClassMetadata(ChildModel, 'collection', 'children');
    storage.registerClassMetadata(ChildModel, 'connection', 'remote');

    const merged = storage.getMergedClassMetadata(ChildModel);
    expect(merged.collection).toBe('children');
    expect(merged.connection).toBe('remote');
  });

  it('observers are concatenated (parent first, then child)', () => {
    class ParentObserver {}
    class ChildObserver {}

    storage.registerClassMetadata(ParentModel, 'observers', [ParentObserver]);
    storage.registerClassMetadata(ChildModel, 'observers', [ChildObserver]);

    const merged = storage.getMergedClassMetadata(ChildModel);
    expect(merged.observers).toHaveLength(2);
    expect(merged.observers[0]!).toBe(ParentObserver);
    expect(merged.observers[1]!).toBe(ChildObserver);
  });
});

// ---------------------------------------------------------------------------
// Inheritance — getMergedFillableFields
// ---------------------------------------------------------------------------

describe('MetadataStorage — Inheritance — getMergedFillableFields', () => {
  it('returns the union of parent and child fillable fields', () => {
    storage.registerColumn(ParentModel, 'name', { type: 'string' });
    storage.registerColumnFlag(ParentModel, 'name', 'isFillable', true);
    storage.registerColumn(ChildModel, 'age', { type: 'integer' });
    storage.registerColumnFlag(ChildModel, 'age', 'isFillable', true);

    const fillable = storage.getMergedFillableFields(ChildModel);
    expect(fillable.size).toBe(2);
    expect(fillable.has('name')).toBe(true);
    expect(fillable.has('age')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Inheritance — getMergedCasts
// ---------------------------------------------------------------------------

describe('MetadataStorage — Inheritance — getMergedCasts', () => {
  it('child cast overrides parent cast for the same key', () => {
    storage.registerColumn(ParentModel, 'createdAt', { type: 'string' });
    storage.registerColumnFlag(ParentModel, 'createdAt', 'castType', 'string');
    storage.registerColumn(ChildModel, 'createdAt', { type: 'string' });
    storage.registerColumnFlag(ChildModel, 'createdAt', 'castType', 'date');

    const casts = storage.getMergedCasts(ChildModel);
    expect(casts.get('createdAt')).toBe('date');
  });

  it('includes parent casts that are not overridden', () => {
    storage.registerColumn(ParentModel, 'score', { type: 'number' });
    storage.registerColumnFlag(ParentModel, 'score', 'castType', 'float');
    storage.registerColumn(ChildModel, 'age', { type: 'integer' });
    storage.registerColumnFlag(ChildModel, 'age', 'castType', 'integer');

    const casts = storage.getMergedCasts(ChildModel);
    expect(casts.size).toBe(2);
    expect(casts.get('score')).toBe('float');
    expect(casts.get('age')).toBe('integer');
  });
});

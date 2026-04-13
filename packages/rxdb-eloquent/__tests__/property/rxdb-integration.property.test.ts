/**
 * @file rxdb-integration.property.test.ts
 * @description Property-based tests for the RxDB integration layer using fast-check.
 *
 * These tests verify that the Model, QueryBuilder, SoftDeletes, MangoQueryGrammar,
 * and Relation classes correctly interact with a real in-memory RxDB database.
 * Each property test generates random valid inputs and asserts universal invariants
 * hold across all executions.
 *
 * Test infrastructure:
 * - Uses RxDB's in-memory storage for fast, isolated test execution
 * - Creates fresh ConnectionManager → Connection → RxDatabase per test suite
 * - Registers test Model subclasses (TestItem, SoftItem) with appropriate schemas
 * - Tears down (closes database) after each suite
 */

import fc from 'fast-check';
import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import type { RxDatabase } from 'rxdb';
import { firstValueFrom } from 'rxjs';

import { Model } from '@/model/model';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { ConnectionManager } from '@/connection/connection.manager';
import { Connection } from '@/connection/connection';
import { MangoQueryGrammar } from '@/query/grammars/mango-query.grammar';
import { HasOneRelation } from '@/relations/has-one.relation';
import { HasManyRelation } from '@/relations/has-many.relation';
import { BelongsToRelation } from '@/relations/belongs-to.relation';
import { BelongsToManyRelation } from '@/relations/belongs-to-many.relation';

// ---------------------------------------------------------------------------
// RxJsonSchema definitions for test models
// ---------------------------------------------------------------------------

/** Schema for the basic TestItem model with id, name, email, age, and timestamps. */
const testItemSchema = {
  version: 0,
  type: 'object' as const,
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    email: { type: 'string', maxLength: 200 },
    age: { type: 'number' },
    created_at: { type: 'string', maxLength: 100 },
    updated_at: { type: 'string', maxLength: 100 },
  },
  required: ['id', 'name'],
};

/** Schema for the SoftItem model — adds deleted_at for soft deletes. */
const softItemSchema = {
  version: 0,
  type: 'object' as const,
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
    email: { type: 'string', maxLength: 200 },
    age: { type: 'number' },
    created_at: { type: 'string', maxLength: 100 },
    updated_at: { type: 'string', maxLength: 100 },
    deleted_at: { type: ['string', 'null'], maxLength: 100 },
  },
  required: ['id', 'name'],
};

/** Schema for Profile (HasOne relation tests). */
const profileSchema = {
  version: 0,
  type: 'object' as const,
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    user_id: { type: 'string', maxLength: 100 },
    bio: { type: 'string', maxLength: 500 },
  },
  required: ['id', 'user_id'],
};

/** Schema for Post (HasMany relation tests). */
const postSchema = {
  version: 0,
  type: 'object' as const,
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    author_id: { type: 'string', maxLength: 100 },
    title: { type: 'string', maxLength: 200 },
  },
  required: ['id', 'author_id'],
};

/** Schema for Role (BelongsToMany relation tests). */
const roleSchema = {
  version: 0,
  type: 'object' as const,
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string', maxLength: 200 },
  },
  required: ['id', 'name'],
};

/** Schema for user_roles pivot collection (BelongsToMany). */
const userRolesPivotSchema = {
  version: 0,
  type: 'object' as const,
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 100 },
    user_id: { type: 'string', maxLength: 100 },
    role_id: { type: 'string', maxLength: 100 },
  },
  required: ['id', 'user_id', 'role_id'],
};

// ---------------------------------------------------------------------------
// Test Model subclasses
// ---------------------------------------------------------------------------

/** Basic test model without soft deletes. */
class TestItem extends Model {
  static collection = 'test_items';
  static connection = 'default';
  static primaryKey = 'id';
  static timestamps = true;
  static fillable = ['*'];
  static guarded: string[] = [];
}

/** Test model with soft deletes enabled. */
class SoftItem extends Model {
  static collection = 'soft_items';
  static connection = 'default';
  static primaryKey = 'id';
  static timestamps = true;
  static fillable = ['*'];
  static guarded: string[] = [];
}

/** Profile model for HasOne relation tests. */
class ProfileModel extends Model {
  static collection = 'profiles';
  static connection = 'default';
  static primaryKey = 'id';
  static timestamps = false;
  static fillable = ['*'];
  static guarded: string[] = [];
}

/** Post model for HasMany relation tests. */
class PostModel extends Model {
  static collection = 'posts';
  static connection = 'default';
  static primaryKey = 'id';
  static timestamps = false;
  static fillable = ['*'];
  static guarded: string[] = [];
}

/** Role model for BelongsToMany relation tests. */
class RoleModel extends Model {
  static collection = 'roles';
  static connection = 'default';
  static primaryKey = 'id';
  static timestamps = false;
  static fillable = ['*'];
  static guarded: string[] = [];
}

// ---------------------------------------------------------------------------
// fast-check arbitraries
// ---------------------------------------------------------------------------

/** Generates a safe name string. */
const safeNameArb = fc.stringMatching(/^[A-Za-z][A-Za-z ]{0,19}$/).filter((s) => s.length >= 1);

/** Generates a safe email-like string. */
const safeEmailArb = fc.stringMatching(/^[a-z]{3,8}@[a-z]{3,6}\.[a-z]{2,3}$/);

/** Generates a safe age number. */
const safeAgeArb = fc.integer({ min: 1, max: 120 });

/** Global counter for unique IDs — prevents RxDB CONFLICT errors across iterations. */
let iterationCounter = 0;

/** Creates a unique ID by combining a prefix with a monotonic counter. */
function uid(prefix: string): string {
  return `${prefix}_${++iterationCounter}`;
}

/** Generates TestItem attributes with a guaranteed unique ID. */
const testItemAttrsArb = fc.record({
  name: safeNameArb,
  email: safeEmailArb,
  age: safeAgeArb,
}).map((a) => ({ ...a, id: uid('ti') }));

// ---------------------------------------------------------------------------
// Test environment helpers
// ---------------------------------------------------------------------------

let dbCounter = 0;

/** Creates a fresh in-memory RxDB test environment with all collections. */
async function createTestEnv() {
  const dbName = `testdb_${Date.now()}_${dbCounter++}`;
  const database: RxDatabase = await createRxDatabase({
    name: dbName,
    storage: getRxStorageMemory(),
    multiInstance: false,
    eventReduce: false,
  });

  const connection = new Connection('default', 'memory', database);
  const manager = new ConnectionManager({
    default: 'default',
    connections: { default: { driver: 'memory', name: dbName } },
  });

  /** Inject our pre-built connection into the manager's cache. */
  (manager as any).connections.set('default', connection);
  Model.setConnectionManager(manager);

  /** Register metadata for all test model classes. */
  const storage = MetadataStorage.getInstance();
  for (const [cls, col, ts, sd] of [
    [TestItem, 'test_items', true, false],
    [SoftItem, 'soft_items', true, true],
    [ProfileModel, 'profiles', false, false],
    [PostModel, 'posts', false, false],
    [RoleModel, 'roles', false, false],
  ] as const) {
    storage.registerClassMetadata(cls as any, 'collection', col);
    storage.registerClassMetadata(cls as any, 'connection', 'default');
    storage.registerClassMetadata(cls as any, 'timestamps', ts);
    storage.registerClassMetadata(cls as any, 'softDeletes', sd);
  }

  /** Create all RxDB collections. */
  await connection.addCollection('test_items', testItemSchema as any);
  await connection.addCollection('soft_items', softItemSchema as any);
  await connection.addCollection('profiles', profileSchema as any);
  await connection.addCollection('posts', postSchema as any);
  await connection.addCollection('roles', roleSchema as any);
  await connection.addCollection('user_roles', userRolesPivotSchema as any);

  return { database, connection, manager };
}

/** Tears down the test environment. */
async function teardownTestEnv(env: { database: RxDatabase; manager: ConnectionManager }) {
  try { await env.database.close(); } catch { /* already closed */ }
  Model.setConnectionManager(null as any);
  MetadataStorage.getInstance().clear();
}


// ===========================================================================
// Property Tests
// ===========================================================================

describe('RxDB Integration Property Tests', () => {
  let env: Awaited<ReturnType<typeof createTestEnv>>;

  beforeEach(async () => {
    env = await createTestEnv();
  });

  afterEach(async () => {
    await teardownTestEnv(env);
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 1: Insert-Find Round Trip
  // **Validates: Requirements 1.4, 1.5, 3.1, 3.2, 3.4, 5.1, 5.2, 5.3**
  // -------------------------------------------------------------------------
  describe('Property 1: Insert-Find Round Trip', () => {
    it('save() then find() returns matching attributes', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new TestItem(attrs);
          await item.save();

          const found = await TestItem.find(attrs.id);
          expect(found).not.toBeNull();
          expect(found!.getAttribute('id')).toBe(attrs.id);
          expect(found!.getAttribute('name')).toBe(attrs.name);
          expect(found!.getAttribute('email')).toBe(attrs.email);
          expect(found!.getAttribute('age')).toBe(attrs.age);
          expect(found!.getAttribute('created_at')).toBeTruthy();
          expect(found!.getAttribute('updated_at')).toBeTruthy();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 2-3: Lifecycle events and cancellation
  // **Validates: Requirements 1.1, 1.7, 2.1, 2.7, 6.1, 6.4, 7.1, 7.5, 8.1, 8.5**
  // **Validates: Requirements 1.2, 2.2, 6.2, 7.2, 8.2**
  // -------------------------------------------------------------------------
  describe('Property 2-3: Lifecycle events and cancellation', () => {
    it('lifecycle events fire in correct order during insert', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const events: string[] = [];
          const item = new TestItem(attrs);
          item.registerHook('creating', () => { events.push('creating'); });
          item.registerHook('created', () => { events.push('created'); });

          await item.save();
          expect(events).toEqual(['creating', 'created']);
        }),
        { numRuns: 100 },
      );
    });

    it('pre-event returning false cancels the insert', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new TestItem(attrs);
          item.registerHook('creating', () => false);

          await item.save();

          const found = await TestItem.find(attrs.id);
          expect(found).toBeNull();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 4: Timestamps
  // **Validates: Requirements 1.3, 2.3**
  // -------------------------------------------------------------------------
  describe('Property 4: Timestamps', () => {
    it('insert sets both created_at and updated_at; update changes only updated_at', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new TestItem(attrs);
          await item.save();

          const createdAt = item.getAttribute('created_at');
          const updatedAt = item.getAttribute('updated_at');
          expect(typeof createdAt).toBe('string');
          expect(typeof updatedAt).toBe('string');

          /** Small delay so updated_at will differ. */
          await new Promise((r) => setTimeout(r, 5));

          item.setAttribute('name', attrs.name + 'X');
          await item.save();

          /** created_at unchanged, updated_at changed. */
          expect(item.getAttribute('created_at')).toBe(createdAt);
          expect(item.getAttribute('updated_at')).not.toBe(updatedAt);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 5: Dirty tracking
  // **Validates: Requirements 1.6, 2.4, 2.5, 2.6, 2.7, 24.5**
  // -------------------------------------------------------------------------
  describe('Property 5: Dirty tracking', () => {
    it('getDirtyAttributes returns only changed fields', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, safeNameArb, async (attrs, newName) => {
          const item = new TestItem(attrs);
          await item.save();

          /** After save, no dirty attributes. */
          expect(Object.keys(item.getDirtyAttributes()).length).toBe(0);

          item.setAttribute('name', newName);
          const dirty = item.getDirtyAttributes();
          if (newName !== attrs.name) {
            expect(dirty).toHaveProperty('name', newName);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 6: Null returns for non-existent IDs
  // **Validates: Requirements 3.3, 11.3**
  // -------------------------------------------------------------------------
  describe('Property 6: Null returns for non-existent IDs', () => {
    it('find() returns null for IDs that do not exist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null).map(() => uid('nonexist')),
          async (randomId) => {
            const found = await TestItem.find(randomId);
            expect(found).toBeNull();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 7: Hard delete removes document
  // **Validates: Requirements 6.3, 6.4**
  // -------------------------------------------------------------------------
  describe('Property 7: Hard delete removes document', () => {
    it('delete() permanently removes the document', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new TestItem(attrs);
          await item.save();

          expect(await TestItem.find(attrs.id)).not.toBeNull();

          await item.delete();
          expect((item as any)._exists).toBe(false);
          expect(await TestItem.find(attrs.id)).toBeNull();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 8-9: Soft delete and restore round trip
  // **Validates: Requirements 7.3, 7.4, 7.5, 8.3, 8.4**
  // -------------------------------------------------------------------------
  describe('Property 8-9: Soft delete and restore round trip', () => {
    it('soft delete sets deleted_at; restore clears it', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new SoftItem(attrs);
          await item.save();

          await item.delete();
          expect(item.getAttribute('deleted_at')).toBeTruthy();
          expect((item as any)._exists).toBe(true);
          expect(item.trashed()).toBe(true);

          await item.restore();
          expect(item.getAttribute('deleted_at')).toBeNull();
          expect(item.trashed()).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 10: Force delete permanently removes
  // **Validates: Requirements 9.1, 9.2**
  // -------------------------------------------------------------------------
  describe('Property 10: Force delete permanently removes', () => {
    it('forceDelete() permanently removes a soft-deletable document', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new SoftItem(attrs);
          await item.save();

          await item.forceDelete();
          expect((item as any)._exists).toBe(false);
          expect(await SoftItem.find(attrs.id)).toBeNull();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 11-13: QueryBuilder get(), first(), count()
  // **Validates: Requirements 4.1, 10.1, 10.4, 11.1, 11.4, 12.3**
  // -------------------------------------------------------------------------
  describe('Property 11-13: QueryBuilder get(), first(), count()', () => {
    it('get() returns hydrated models; first() returns one; count() matches', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(testItemAttrsArb, { minLength: 1, maxLength: 5 }),
          async (attrsArray) => {
            /**
             * Use a unique batch marker so we can filter for only this iteration's items.
             * This avoids counting items from previous iterations in the same database.
             */
            const batchMarker = uid('batch');
            const taggedAttrs = attrsArray.map((a) => ({ ...a, email: batchMarker }));

            for (const attrs of taggedAttrs) {
              const item = new TestItem(attrs);
              await item.save();
            }

            /** get() with filter should return exactly this batch's items. */
            const all = await TestItem.query().where('email', batchMarker).get();
            expect(all.length).toBe(taggedAttrs.length);
            for (const model of all) {
              expect((model as any)._exists).toBe(true);
              expect((model as any)._rxDocument).not.toBeNull();
            }

            /** first() with filter should return exactly one model. */
            const first = await TestItem.query().where('email', batchMarker).first();
            expect(first).not.toBeNull();

            /** count() with filter should match the batch size. */
            const count = await TestItem.query().where('email', batchMarker).count();
            expect(count).toBe(taggedAttrs.length);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 14-15: Reactive queries and model $
  // **Validates: Requirements 13.3, 13.4, 14.1**
  // -------------------------------------------------------------------------
  describe('Property 14-15: Reactive queries and model $ observable', () => {
    it('observe() emits results; model.$ emits on changes', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const item = new TestItem(attrs);
          await item.save();

          const results = await firstValueFrom(TestItem.query().observe());
          expect(results.length).toBeGreaterThanOrEqual(1);

          const emitted = await firstValueFrom(item.$);
          expect(emitted).toBeTruthy();
          expect(emitted.getAttribute('id')).toBe(attrs.id);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 16: Relation resolution
  // **Validates: Requirements 15.2, 16.2, 17.2**
  // -------------------------------------------------------------------------
  describe('Property 16: Relation resolution (HasOne, HasMany, BelongsTo)', () => {
    it('HasOne, HasMany, and BelongsTo resolve correct related models', async () => {
      await fc.assert(
        fc.asyncProperty(safeNameArb, async (bio) => {
          const userId = uid('usr');
          const postId = uid('pst');

          const user = new TestItem({ id: userId, name: 'User' });
          await user.save();

          const profile = new ProfileModel({ id: uid('prf'), user_id: userId, bio });
          await profile.save();

          const post = new PostModel({ id: postId, author_id: userId, title: 'Post' });
          await post.save();

          /** HasOne: user has one profile. */
          const hasOne = new HasOneRelation(user, ProfileModel, 'user_id', 'id');
          const foundProfile = await hasOne.get();
          expect(foundProfile).not.toBeNull();
          expect((foundProfile as any).getAttribute('user_id')).toBe(userId);

          /** HasMany: user has many posts. */
          const hasMany = new HasManyRelation(user, PostModel, 'author_id', 'id');
          const foundPosts = await hasMany.get();
          expect(foundPosts.length).toBeGreaterThanOrEqual(1);

          /** BelongsTo: post belongs to user. */
          const belongsTo = new BelongsToRelation(post, TestItem, 'author_id', 'id');
          const foundUser = await belongsTo.get();
          expect(foundUser).not.toBeNull();
          expect((foundUser as any).getAttribute('id')).toBe(userId);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 17-19: BelongsToMany attach/detach/sync
  // **Validates: Requirements 18.5, 19.2, 20.1, 20.2, 21.2, 21.3**
  // -------------------------------------------------------------------------
  describe('Property 17-19: BelongsToMany attach/detach/sync', () => {
    it('attach/detach/sync manage pivot entries correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 3 }),
          async (roleCount) => {
            const userId = uid('usr');
            const roleIds = Array.from({ length: roleCount }, () => uid('role'));

            const user = new TestItem({ id: userId, name: 'User' });
            await user.save();

            for (const roleId of roleIds) {
              const role = new RoleModel({ id: roleId, name: `R_${roleId}` });
              await role.save();
            }

            const relation = new BelongsToManyRelation(
              user, RoleModel, 'user_roles', 'user_id', 'role_id',
            );

            /** Attach all roles. */
            await relation.attach(roleIds);
            const attached = await relation.get();
            expect(attached.length).toBe(roleIds.length);

            /** Detach the first role if multiple. */
            if (roleIds.length > 1) {
              await relation.detach(roleIds[0]!);
              const afterDetach = await relation.get();
              expect(afterDetach.length).toBe(roleIds.length - 1);
            }

            /** Sync to only the last role. */
            const syncTarget = [roleIds[roleIds.length - 1]!];
            await relation.sync(syncTarget);
            const afterSync = await relation.get();
            expect(afterSync.length).toBe(1);
            expect((afterSync[0] as any).getAttribute('id')).toBe(syncTarget[0]);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 20: Error propagation
  // **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 22.5**
  // -------------------------------------------------------------------------
  describe('Property 20: Error propagation', () => {
    it('operations throw when ConnectionManager is not set', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null).map(() => uid('err')), async (id) => {
          const savedManager = (Model as any)._connectionManager;
          Model.setConnectionManager(null as any);

          await expect(TestItem.find(id)).rejects.toThrow();

          Model.setConnectionManager(savedManager);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 21: isConnected reflects state
  // **Validates: Requirements 22.6, 25.1, 25.4, 25.5**
  // -------------------------------------------------------------------------
  describe('Property 21: isConnected reflects state', () => {
    it('isConnected() returns true when manager is set, false when null', () => {
      fc.assert(
        fc.property(fc.boolean(), (setManager) => {
          if (setManager) {
            Model.setConnectionManager(env.manager);
            expect(Model.isConnected()).toBe(true);
          } else {
            Model.setConnectionManager(null as any);
            expect(Model.isConnected()).toBe(false);
            Model.setConnectionManager(env.manager);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 22: Soft delete query scope compilation
  // **Validates: Requirements 23.1, 23.2, 23.3**
  // -------------------------------------------------------------------------
  describe('Property 22: Soft delete query scope compilation', () => {
    it('default adds deleted_at eq null; withTrashed omits; onlyTrashed adds ne null', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const grammar = new MangoQueryGrammar();
          const baseState = {
            wheres: [], orders: [], limitValue: null, skipValue: null,
            withTrashedFlag: false, onlyTrashedFlag: false,
            withoutGlobalScopeNames: [], eagerLoads: [],
          };

          const defaultQ = grammar.compile(baseState, 'deleted_at', false);
          expect(defaultQ.selector['deleted_at']).toEqual({ $eq: null });

          const withTrashedQ = grammar.compile(baseState, null, false);
          expect(withTrashedQ.selector['deleted_at']).toBeUndefined();

          const onlyTrashedQ = grammar.compile(baseState, 'deleted_at', true);
          expect(onlyTrashedQ.selector['deleted_at']).toEqual({ $ne: null });
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Feature: rxdb-integration, Property 23: Hydration produces correct model state
  // **Validates: Requirements 24.3, 24.4, 24.5, 24.6**
  // -------------------------------------------------------------------------
  describe('Property 23: Hydration produces correct model state', () => {
    it('hydrate() sets _exists, _rxDocument, fills attributes, no dirty', async () => {
      await fc.assert(
        fc.asyncProperty(testItemAttrsArb, async (attrs) => {
          const collection = env.connection.getCollection('test_items');
          const doc = await collection.insert({
            ...attrs,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          const hydrated = TestItem.hydrate(doc);
          expect((hydrated as any)._exists).toBe(true);
          expect((hydrated as any)._rxDocument).toBe(doc);
          expect(hydrated.getAttribute('id')).toBe(attrs.id);
          expect(hydrated.getAttribute('name')).toBe(attrs.name);
          expect(Object.keys(hydrated.getDirtyAttributes()).length).toBe(0);
        }),
        { numRuns: 100 },
      );
    });
  });
});

/**
 * @file rxdb-integration-edge-cases.test.ts
 * @description Unit tests for RxDB integration edge cases.
 *
 * These tests verify specific error conditions and boundary behaviors
 * that are difficult to cover with property-based tests alone:
 *
 * - ConnectionManager not set throws a descriptive error
 * - Collection not found throws a descriptive error
 * - Missing _rxDocument on update/delete/forceDelete throws
 * - save() is a no-op when no dirty attributes exist on an existing model
 * - Model $ observable emits once and completes for unsaved models
 *
 * Test infrastructure mirrors the property tests: in-memory RxDB,
 * ConnectionManager, Connection, and MetadataStorage registration.
 */

import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import type { RxDatabase } from 'rxdb';

import { Model } from '@/model/model';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { ConnectionManager } from '@/connection/connection.manager';
import { Connection } from '@/connection/connection';

// ---------------------------------------------------------------------------
// RxJsonSchema definitions for test models
// ---------------------------------------------------------------------------

/**
 * Schema for the basic TestItem model.
 * Includes id, name, email, age, and timestamp fields.
 */
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

/**
 * Schema for the SoftItem model — adds deleted_at for soft deletes.
 */
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

// ---------------------------------------------------------------------------
// Test environment helpers
// ---------------------------------------------------------------------------

/** Counter for unique database names across test runs. */
let dbCounter = 0;

/** Counter for unique IDs within tests. */
let idCounter = 0;

/** Creates a unique ID for test items. */
function uid(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

/**
 * Creates a fresh in-memory RxDB test environment.
 * Sets up ConnectionManager, Connection, and registers metadata
 * for TestItem and SoftItem models.
 */
async function createTestEnv() {
  const dbName = `edgetest_${Date.now()}_${dbCounter++}`;
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

  /** Register metadata for test model classes. */
  const storage = MetadataStorage.getInstance();
  for (const [cls, col, ts, sd] of [
    [TestItem, 'test_items', true, false],
    [SoftItem, 'soft_items', true, true],
  ] as const) {
    storage.registerClassMetadata(cls as any, 'collection', col);
    storage.registerClassMetadata(cls as any, 'connection', 'default');
    storage.registerClassMetadata(cls as any, 'timestamps', ts);
    storage.registerClassMetadata(cls as any, 'softDeletes', sd);
  }

  /** Create RxDB collections. */
  await connection.addCollection('test_items', testItemSchema as any);
  await connection.addCollection('soft_items', softItemSchema as any);

  return { database, connection, manager };
}

/** Tears down the test environment, closing the database and clearing metadata. */
async function teardownTestEnv(env: { database: RxDatabase }) {
  try {
    await env.database.close();
  } catch {
    /* already closed */
  }
  Model.setConnectionManager(null as any);
  MetadataStorage.getInstance().clear();
}

// ===========================================================================
// Edge Case Tests
// ===========================================================================

describe('RxDB Integration Edge Cases', () => {
  let env: Awaited<ReturnType<typeof createTestEnv>>;

  beforeEach(async () => {
    env = await createTestEnv();
  });

  afterEach(async () => {
    await teardownTestEnv(env);
  });

  // -------------------------------------------------------------------------
  // 9.1 ConnectionManager not set throws specific error message
  // -------------------------------------------------------------------------
  describe('9.1 ConnectionManager not set throws specific error message', () => {
    it('should throw "ConnectionManager not set. Did you call EloquentModule.forRoot()?" when _connectionManager is null', async () => {
      /** Save the current manager so we can restore it after the test. */
      const savedManager = (Model as any)._connectionManager;

      /** Set _connectionManager to null to simulate uninitialized state. */
      Model.setConnectionManager(null as any);

      await expect(TestItem.find('x')).rejects.toThrow(
        'ConnectionManager not set. Did you call EloquentModule.forRoot()?',
      );

      /** Restore the original manager for cleanup. */
      Model.setConnectionManager(savedManager);
    });
  });

  // -------------------------------------------------------------------------
  // 9.2 Collection not found throws specific error message
  // -------------------------------------------------------------------------
  describe('9.2 Collection not found throws specific error message', () => {
    it('should throw collection-not-found error when the collection does not exist on the database', async () => {
      /**
       * Create a separate database WITHOUT the test_items collection.
       * Register a ConnectionManager pointing to this bare database.
       */
      const bareDbName = `baredb_${Date.now()}_${dbCounter++}`;
      const bareDatabase: RxDatabase = await createRxDatabase({
        name: bareDbName,
        storage: getRxStorageMemory(),
        multiInstance: false,
        eventReduce: false,
      });

      const bareConnection = new Connection('default', 'memory', bareDatabase);
      const bareManager = new ConnectionManager({
        default: 'default',
        connections: { default: { driver: 'memory', name: bareDbName } },
      });
      (bareManager as any).connections.set('default', bareConnection);
      Model.setConnectionManager(bareManager);

      /**
       * TestItem expects collection "test_items" which doesn't exist
       * on the bare database. This should throw with a descriptive message.
       */
      await expect(TestItem.find('x')).rejects.toThrow(
        'Collection "test_items" does not exist on database "default".',
      );

      /** Clean up the bare database. */
      try {
        await bareDatabase.close();
      } catch {
        /* ignore */
      }
    });
  });

  // -------------------------------------------------------------------------
  // 9.3 _rxDocument null on update throws specific error message
  // -------------------------------------------------------------------------
  describe('9.3 _rxDocument null on update throws specific error message', () => {
    it('should throw when save() is called on an existing model with null _rxDocument', async () => {
      /**
       * Create a TestItem and manually set _exists = true but leave
       * _rxDocument as null. This simulates a model that claims to
       * exist but has lost its RxDocument reference.
       */
      const item = new TestItem({ id: uid('upd'), name: 'Test' });
      (item as any)._exists = true;
      (item as any)._rxDocument = null;

      /** Change an attribute so save() attempts an update path. */
      item.setAttribute('name', 'Updated');

      await expect(item.save()).rejects.toThrow(
        'Cannot update: RxDocument reference is missing. Was this model hydrated from a query?',
      );
    });
  });

  // -------------------------------------------------------------------------
  // 9.4 _rxDocument null on delete throws specific error message
  // -------------------------------------------------------------------------
  describe('9.4 _rxDocument null on delete throws specific error message', () => {
    it('should throw when delete() is called on an existing model with null _rxDocument', async () => {
      /**
       * Create a TestItem (no soft deletes) and manually set _exists = true
       * but leave _rxDocument as null.
       */
      const item = new TestItem({ id: uid('del'), name: 'Test' });
      (item as any)._exists = true;
      (item as any)._rxDocument = null;

      await expect(item.delete()).rejects.toThrow(
        'Cannot delete: RxDocument reference is missing. Was this model hydrated from a query?',
      );
    });
  });

  // -------------------------------------------------------------------------
  // 9.5 _rxDocument null on forceDelete throws specific error message
  // -------------------------------------------------------------------------
  describe('9.5 _rxDocument null on forceDelete throws specific error message', () => {
    it('should throw when forceDelete() is called on a SoftItem with null _rxDocument', async () => {
      /**
       * Create a SoftItem (soft deletes enabled) and manually set
       * _exists = true but leave _rxDocument as null.
       */
      const item = new SoftItem({ id: uid('fdel'), name: 'Test' });
      (item as any)._exists = true;
      (item as any)._rxDocument = null;

      await expect(item.forceDelete()).rejects.toThrow(
        'Cannot forceDelete: RxDocument reference is missing.',
      );
    });
  });

  // -------------------------------------------------------------------------
  // 9.6 save() no-op when no dirty attributes on existing model
  // -------------------------------------------------------------------------
  describe('9.6 save() no-op when no dirty attributes on existing model', () => {
    it('should not call incrementalPatch when save() is called with no dirty attributes', async () => {
      /**
       * Insert a real item. After save(), syncOriginal() snapshots
       * the current attributes (including timestamps). When save() is
       * called again without user changes, touchTimestamps() will set
       * updated_at to a new value — making it dirty. To test the true
       * no-op path (Requirement 2.5), we spy on incrementalPatch and
       * verify it is called ONLY with the updated_at timestamp field,
       * not with any user-changed attributes.
       *
       * Alternatively, we freeze updated_at by overriding touchTimestamps
       * so that no dirty attributes exist at all.
       */
      const item = new TestItem({ id: uid('noop'), name: 'NoOp' });
      await item.save();

      /**
       * Override touchTimestamps to be a no-op so that updated_at
       * doesn't change. This isolates the "no dirty user attributes"
       * scenario.
       */
      const originalTouch = (item as any).touchTimestamps.bind(item);
      (item as any).touchTimestamps = () => {
        /* no-op — prevent timestamp from creating dirty attributes */
      };

      /** Spy on the _rxDocument.incrementalPatch method. */
      const patchSpy = vi.spyOn((item as any)._rxDocument, 'incrementalPatch');

      await item.save();

      /** incrementalPatch should NOT have been called since nothing is dirty. */
      expect(patchSpy).not.toHaveBeenCalled();

      /** Restore original touchTimestamps. */
      (item as any).touchTimestamps = originalTouch;
      patchSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // 9.7 Model $ observable emits once and completes for unsaved model
  // -------------------------------------------------------------------------
  describe('9.7 Model $ observable emits once and completes for unsaved model', () => {
    it('should emit the current model once and complete when no _rxDocument is attached', async () => {
      /** Create a new unsaved TestItem — no _rxDocument attached. */
      const item = new TestItem({ id: uid('obs'), name: 'Observable' });

      const emissions: any[] = [];
      let completed = false;

      /**
       * Subscribe to item.$. For an unsaved model (no _rxDocument),
       * the observable should emit the model instance once and then complete.
       */
      await new Promise<void>((resolve) => {
        item.$.subscribe({
          next: (value) => emissions.push(value),
          complete: () => {
            completed = true;
            resolve();
          },
          error: () => resolve(),
        });
      });

      /** Should have emitted exactly once with the model instance. */
      expect(emissions.length).toBe(1);
      expect(emissions[0]).toBe(item);

      /** The observable should have completed. */
      expect(completed).toBe(true);
    });
  });
});

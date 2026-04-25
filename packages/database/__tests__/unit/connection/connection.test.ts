/**
 * @file connection.test.ts
 * @description Unit tests for the Connection class. Verifies constructor property
 * assignment, collection retrieval errors, addCollection functionality, and
 * database close lifecycle.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { Connection } from '@/connection/connection';
import type { RxDatabase } from 'rxdb';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let db: RxDatabase | null = null;

/** Create a fresh in-memory RxDatabase with a unique name. */
async function createTestDb(): Promise<RxDatabase> {
  db = await createRxDatabase({
    name: `test-conn-${Date.now()}-${Math.random()}`,
    storage: getRxStorageMemory(),
    multiInstance: false,
    eventReduce: false,
  });
  return db;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Connection', () => {
  afterEach(async () => {
    if (db && !(db as any).closed) {
      await db.close();
    }
    db = null;
  });

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  it('sets name, driver, and database properties', async () => {
    const database = await createTestDb();
    const conn = new Connection('local', 'memory', database);

    expect(conn.name).toBe('local');
    expect(conn.driver).toBe('memory');
    expect(conn.database).toBe(database);
  });

  // -------------------------------------------------------------------------
  // getCollection() — error on nonexistent
  // -------------------------------------------------------------------------

  it('getCollection("nonexistent") throws an error', async () => {
    const database = await createTestDb();
    const conn = new Connection('local', 'memory', database);

    expect(() => conn.getCollection('nonexistent')).toThrow(
      /Collection "nonexistent" does not exist/
    );
  });

  // -------------------------------------------------------------------------
  // addCollection()
  // -------------------------------------------------------------------------

  it('addCollection() creates a collection on the database', async () => {
    const database = await createTestDb();
    const conn = new Connection('local', 'memory', database);

    const collection = await conn.addCollection('items', {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: { type: 'string', maxLength: 100 },
        title: { type: 'string' },
      },
      required: ['id'],
    });

    expect(collection).toBeDefined();
    // Should now be retrievable
    const retrieved = conn.getCollection('items');
    expect(retrieved).toBe(collection);
  });

  // -------------------------------------------------------------------------
  // close()
  // -------------------------------------------------------------------------

  it('close() closes the underlying database', async () => {
    const database = await createTestDb();
    const conn = new Connection('local', 'memory', database);

    await conn.close();

    expect((database as any).closed).toBe(true);
    // Prevent afterEach from double-closing
    db = null;
  });
});

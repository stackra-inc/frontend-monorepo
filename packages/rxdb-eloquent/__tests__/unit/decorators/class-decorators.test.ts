/**
 * @file class-decorators.test.ts
 * @description Unit tests for all class-level decorators: @Collection, @Connection,
 * @Timestamps, @SoftDeletes, and @ObservedBy.
 *
 * Each test applies a decorator to a fresh class and verifies that the correct
 * metadata is stored in MetadataStorage.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { Collection } from '@/decorators/collection.decorator';
import { Connection } from '@/decorators/connection.decorator';
import { Timestamps } from '@/decorators/timestamps.decorator';
import { SoftDeletes } from '@/decorators/soft-deletes.decorator';
import { ObservedBy } from '@/decorators/observed-by.decorator';

let storage: MetadataStorage;

beforeEach(() => {
  storage = MetadataStorage.getInstance();
  storage.clear();
});

// ---------------------------------------------------------------------------
// @Collection
// ---------------------------------------------------------------------------

describe('@Collection decorator', () => {
  it('registers the collection name in MetadataStorage', () => {
    @Collection('users')
    class User {}

    const meta = storage.getClassMetadata(User);
    expect(meta.collection).toBe('users');
  });
});

// ---------------------------------------------------------------------------
// @Connection
// ---------------------------------------------------------------------------

describe('@Connection decorator', () => {
  it('registers the connection name in MetadataStorage', () => {
    @Connection('remote')
    class User {}

    const meta = storage.getClassMetadata(User);
    expect(meta.connection).toBe('remote');
  });
});

// ---------------------------------------------------------------------------
// @Timestamps
// ---------------------------------------------------------------------------

describe('@Timestamps decorator', () => {
  it('sets timestamps to true in MetadataStorage', () => {
    @Timestamps()
    class Post {}

    const meta = storage.getClassMetadata(Post);
    expect(meta.timestamps).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @SoftDeletes
// ---------------------------------------------------------------------------

describe('@SoftDeletes decorator', () => {
  it('sets softDeletes to true in MetadataStorage', () => {
    @SoftDeletes()
    class Post {}

    const meta = storage.getClassMetadata(Post);
    expect(meta.softDeletes).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// @ObservedBy
// ---------------------------------------------------------------------------

describe('@ObservedBy decorator', () => {
  it('registers the observer class in MetadataStorage', () => {
    class MockObserver {
      beforeCreate() {}
    }

    @ObservedBy(MockObserver)
    class User {}

    const meta = storage.getClassMetadata(User);
    expect(meta.observers).toHaveLength(1);
    expect(meta.observers[0]).toBe(MockObserver);
  });
});

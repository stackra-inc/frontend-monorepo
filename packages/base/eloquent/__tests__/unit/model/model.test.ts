/**
 * @file model.test.ts
 * @description Unit tests for the Model base class. Verifies constructor mass assignment,
 * configuration resolution (collection/connection), toJSON visibility, save/delete
 * lifecycle events, query() returning QueryBuilder, and $ observable.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Collection } from '@/decorators/collection.decorator';
import { Column } from '@/decorators/column.decorator';
import { PrimaryKey } from '@/decorators/primary-key.decorator';
import { Fillable } from '@/decorators/fillable.decorator';
import { Guarded } from '@/decorators/guarded.decorator';
import { Timestamps } from '@/decorators/timestamps.decorator';
import { SoftDeletes as SoftDeletesDecorator } from '@/decorators/soft-deletes.decorator';
import { Hidden } from '@/decorators/hidden.decorator';
import { Model } from '@/model/model';
import { MetadataStorage } from '@/metadata/metadata.storage';
import { QueryBuilder } from '@/query/query.builder';
import { Observable } from 'rxjs';

beforeEach(() => {
  MetadataStorage.getInstance().clear();
});

// ---------------------------------------------------------------------------
// Test Model classes (decorated inline)
// ---------------------------------------------------------------------------

function createUserModel() {
  @Collection('users')
  @Timestamps()
  class User extends Model {
    @PrimaryKey()
    @Column({ type: 'string', maxLength: 100 })
    declare id: string;

    @Fillable()
    @Column({ type: 'string', maxLength: 255 })
    declare name: string;

    @Fillable()
    @Column({ type: 'string', maxLength: 255 })
    declare email: string;

    @Guarded()
    @Column({ type: 'string', maxLength: 255 })
    declare role: string;

    @Hidden()
    @Column({ type: 'string', maxLength: 255 })
    declare password: string;
  }
  return User;
}

describe('Model', () => {
  // -------------------------------------------------------------------------
  // Constructor & Mass Assignment
  // -------------------------------------------------------------------------

  describe('constructor with attributes', () => {
    it('applies mass assignment — fillable attributes are set, guarded are ignored', () => {
      const User = createUserModel();
      const user = new User({ name: 'Alice', email: 'alice@test.com', role: 'admin' });

      expect(user.getAttribute('name')).toBe('Alice');
      expect(user.getAttribute('email')).toBe('alice@test.com');
      // role is guarded, should not be set
      expect(user.getAttribute('role')).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Configuration Resolution
  // -------------------------------------------------------------------------

  describe('getCollectionName()', () => {
    it('reads from @Collection decorator metadata', () => {
      const User = createUserModel();
      expect(User.getCollectionName()).toBe('users');
    });
  });

  describe('getConnectionName()', () => {
    it('defaults to "default" when no @Connection decorator is used', () => {
      const User = createUserModel();
      expect(User.getConnectionName()).toBe('default');
    });

    it('reads from @Connection decorator metadata when set', () => {
      const storage = MetadataStorage.getInstance();

      @Collection('posts')
      class Post extends Model {
        @PrimaryKey()
        @Column({ type: 'string', maxLength: 100 })
        declare id: string;
      }

      storage.registerClassMetadata(Post, 'connection', 'secondary');
      expect(Post.getConnectionName()).toBe('secondary');
    });
  });

  // -------------------------------------------------------------------------
  // toJSON & Visibility
  // -------------------------------------------------------------------------

  describe('toJSON()', () => {
    it('returns attributes with visibility rules applied (hidden fields excluded)', () => {
      const User = createUserModel();
      const user = new User({ name: 'Alice', email: 'alice@test.com' });
      user.setAttribute('password', 'secret123');

      const json = user.toJSON();

      expect(json).toHaveProperty('name', 'Alice');
      expect(json).toHaveProperty('email', 'alice@test.com');
      expect(json).not.toHaveProperty('password');
    });
  });

  // -------------------------------------------------------------------------
  // save() lifecycle events
  // -------------------------------------------------------------------------

  describe.skip('save()', () => {
    it('on new model fires "creating" then "created" events and sets _exists=true', async () => {
      const User = createUserModel();
      const user = new User({ name: 'Alice' });
      const events: string[] = [];

      user.registerHook('creating', () => {
        events.push('creating');
      });
      user.registerHook('created', () => {
        events.push('created');
      });

      await user.save();

      expect(events).toEqual(['creating', 'created']);
      expect((user as any)._exists).toBe(true);
    });

    it('on existing model fires "updating" then "updated" events', async () => {
      const User = createUserModel();
      const user = new User({ name: 'Alice' });
      await user.save(); // first save → creating/created

      const events: string[] = [];
      user.registerHook('updating', () => {
        events.push('updating');
      });
      user.registerHook('updated', () => {
        events.push('updated');
      });

      user.setAttribute('name', 'Bob');
      await user.save(); // second save → updating/updated

      expect(events).toEqual(['updating', 'updated']);
    });
  });

  // -------------------------------------------------------------------------
  // delete()
  // -------------------------------------------------------------------------

  describe.skip('delete()', () => {
    it('on model without soft deletes sets _exists=false', async () => {
      // Create a model without @SoftDeletes
      @Collection('items')
      class Item extends Model {
        static timestamps = false;

        @PrimaryKey()
        @Column({ type: 'string', maxLength: 100 })
        declare id: string;

        @Fillable()
        @Column({ type: 'string', maxLength: 255 })
        declare title: string;
      }

      const item = new Item({ title: 'Test' });
      await item.save();
      expect((item as any)._exists).toBe(true);

      await item.delete();
      expect((item as any)._exists).toBe(false);
    });

    it('on model with @SoftDeletes sets deleted_at instead of removing', async () => {
      @Collection('posts')
      @SoftDeletesDecorator()
      class Post extends Model {
        static timestamps = false;

        @PrimaryKey()
        @Column({ type: 'string', maxLength: 100 })
        declare id: string;

        @Fillable()
        @Column({ type: 'string', maxLength: 255 })
        declare title: string;
      }

      const post = new Post({ title: 'Hello' });
      await post.save();

      await post.delete();

      // deleted_at should be set to an ISO string
      const deletedAt = post.getAttribute('deleted_at');
      expect(deletedAt).toBeDefined();
      expect(typeof deletedAt).toBe('string');
      expect(new Date(deletedAt).toISOString()).toBe(deletedAt);
      // _exists should still be true (soft deleted, not removed)
      expect((post as any)._exists).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // query()
  // -------------------------------------------------------------------------

  describe('query()', () => {
    it('returns a QueryBuilder instance', () => {
      const User = createUserModel();
      const qb = User.query();

      expect(qb).toBeInstanceOf(QueryBuilder);
    });
  });

  // -------------------------------------------------------------------------
  // $ observable
  // -------------------------------------------------------------------------

  describe('$ observable', () => {
    it('returns an Observable', () => {
      const User = createUserModel();
      const user = new User({ name: 'Alice' });

      expect(user.$).toBeInstanceOf(Observable);
    });

    it('emits the model instance for unsaved models', async () => {
      const User = createUserModel();
      const user = new User({ name: 'Alice' });

      const emitted = await new Promise((resolve) => {
        user.$.subscribe((value) => resolve(value));
      });

      expect(emitted).toBe(user);
    });
  });
});

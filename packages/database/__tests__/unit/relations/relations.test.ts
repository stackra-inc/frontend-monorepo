/**
 * @file relations.test.ts
 * @description Unit tests for all relation classes: HasOneRelation, HasManyRelation,
 * BelongsToRelation, and BelongsToManyRelation. Verifies constructor key storage,
 * accessor methods, and that get()/observe() methods exist.
 */

import { describe, it, expect } from 'vitest';
import { HasOneRelation } from '@/relations/has-one.relation';
import { HasManyRelation } from '@/relations/has-many.relation';
import { BelongsToRelation } from '@/relations/belongs-to.relation';
import { BelongsToManyRelation } from '@/relations/belongs-to-many.relation';

// Mock parent and related models
const mockParent = { id: '1', getAttribute: (key: string) => (mockParent as any)[key] };
const mockRelated = class MockRelated {};

describe('Relations', () => {
  // -------------------------------------------------------------------------
  // HasOneRelation
  // -------------------------------------------------------------------------

  describe('HasOneRelation', () => {
    it('constructor stores foreignKey and localKey', () => {
      const relation = new HasOneRelation(mockParent, mockRelated, 'user_id', 'id');

      expect(relation.getForeignKey()).toBe('user_id');
      expect(relation.getLocalKey()).toBe('id');
    });

    it('get() returns a promise', () => {
      const relation = new HasOneRelation(mockParent, mockRelated, 'user_id', 'id');
      const result = relation.get();

      expect(result).toBeInstanceOf(Promise);
    });

    it('observe() returns an Observable', () => {
      const relation = new HasOneRelation(mockParent, mockRelated, 'user_id', 'id');
      const obs = relation.observe();

      expect(obs).toBeDefined();
      expect(typeof obs.subscribe).toBe('function');
    });
  });

  // -------------------------------------------------------------------------
  // HasManyRelation
  // -------------------------------------------------------------------------

  describe('HasManyRelation', () => {
    it('constructor stores foreignKey and localKey', () => {
      const relation = new HasManyRelation(mockParent, mockRelated, 'author_id', 'id');

      expect(relation.getForeignKey()).toBe('author_id');
      expect(relation.getLocalKey()).toBe('id');
    });

    it('get() returns a promise', () => {
      const relation = new HasManyRelation(mockParent, mockRelated, 'author_id', 'id');
      const result = relation.get();

      expect(result).toBeInstanceOf(Promise);
    });

    it('observe() returns an Observable', () => {
      const relation = new HasManyRelation(mockParent, mockRelated, 'author_id', 'id');
      const obs = relation.observe();

      expect(obs).toBeDefined();
      expect(typeof obs.subscribe).toBe('function');
    });
  });

  // -------------------------------------------------------------------------
  // BelongsToRelation
  // -------------------------------------------------------------------------

  describe('BelongsToRelation', () => {
    it('constructor stores foreignKey and ownerKey', () => {
      const relation = new BelongsToRelation(mockParent, mockRelated, 'author_id', 'id');

      expect(relation.getForeignKey()).toBe('author_id');
      expect(relation.getOwnerKey()).toBe('id');
    });

    it('get() returns a promise', () => {
      const relation = new BelongsToRelation(mockParent, mockRelated, 'author_id', 'id');
      const result = relation.get();

      expect(result).toBeInstanceOf(Promise);
    });

    it('observe() returns an Observable', () => {
      const relation = new BelongsToRelation(mockParent, mockRelated, 'author_id', 'id');
      const obs = relation.observe();

      expect(obs).toBeDefined();
      expect(typeof obs.subscribe).toBe('function');
    });
  });

  // -------------------------------------------------------------------------
  // BelongsToManyRelation
  // -------------------------------------------------------------------------

  describe('BelongsToManyRelation', () => {
    it('constructor stores pivotCollection, foreignPivotKey, and relatedPivotKey', () => {
      const relation = new BelongsToManyRelation(
        mockParent,
        mockRelated,
        'user_roles',
        'user_id',
        'role_id'
      );

      expect(relation.getPivotCollection()).toBe('user_roles');
      expect(relation.getForeignPivotKey()).toBe('user_id');
      expect(relation.getRelatedPivotKey()).toBe('role_id');
    });

    it('get() returns a promise', () => {
      const relation = new BelongsToManyRelation(
        mockParent,
        mockRelated,
        'user_roles',
        'user_id',
        'role_id'
      );
      const result = relation.get();

      expect(result).toBeInstanceOf(Promise);
    });

    it('observe() returns an Observable', () => {
      const relation = new BelongsToManyRelation(
        mockParent,
        mockRelated,
        'user_roles',
        'user_id',
        'role_id'
      );
      const obs = relation.observe();

      expect(obs).toBeDefined();
      expect(typeof obs.subscribe).toBe('function');
    });
  });
});

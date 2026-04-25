/**
 * @file repository.test.ts
 * @description Unit tests for the Repository class. Verifies that the repository
 * accepts a model class and delegates find, findAll, and create operations
 * to the model's static methods.
 */

import { describe, it, expect, vi } from 'vitest';
import { Repository } from '@/repository/repository';

// ---------------------------------------------------------------------------
// Mock model
// ---------------------------------------------------------------------------

const MockModel = {
  find: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
  all: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue({ id: '1' }),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Repository', () => {
  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  it('accepts a model class in the constructor', () => {
    const repo = new Repository(MockModel);

    expect(repo).toBeInstanceOf(Repository);
  });

  // -------------------------------------------------------------------------
  // find()
  // -------------------------------------------------------------------------

  it('find(id) delegates to Model.find(id)', async () => {
    const repo = new Repository(MockModel);

    const result = await repo.find('1');

    expect(MockModel.find).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'Alice' });
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------

  it('findAll() delegates to Model.all()', async () => {
    const repo = new Repository(MockModel);

    const result = await repo.findAll();

    expect(MockModel.all).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // create()
  // -------------------------------------------------------------------------

  it('create(attrs) delegates to Model.create(attrs)', async () => {
    const repo = new Repository(MockModel);
    const attrs = { name: 'Bob', email: 'bob@test.com' };

    const result = await repo.create(attrs);

    expect(MockModel.create).toHaveBeenCalledWith(attrs);
    expect(result).toEqual({ id: '1' });
  });
});

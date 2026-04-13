/**
 * @file service.test.ts
 * @description Unit tests for the Service abstract class. Verifies that the
 * constructor accepts a repositories map and that subclasses can access
 * repositories via this.repositories.
 */

import { describe, it, expect } from 'vitest';
import { Service } from '@/service/service';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** Concrete test service that exposes a repository accessor. */
class TestService extends Service {
  getUsers(): any {
    return this.repositories.users;
  }
}

/** Fake repository stand-in. */
const fakeUserRepo = { find: () => null, findAll: () => [], create: () => ({}) } as any;
const fakePostRepo = { find: () => null, findAll: () => [], create: () => ({}) } as any;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Service', () => {
  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  it('accepts a repositories map in the constructor', () => {
    const service = new TestService({ users: fakeUserRepo });

    expect(service).toBeInstanceOf(TestService);
    expect(service).toBeInstanceOf(Service);
  });

  // -------------------------------------------------------------------------
  // Subclass repository access
  // -------------------------------------------------------------------------

  it('subclass can access repositories via this.repositories', () => {
    const service = new TestService({
      users: fakeUserRepo,
      posts: fakePostRepo,
    });

    expect(service.getUsers()).toBe(fakeUserRepo);
  });
});

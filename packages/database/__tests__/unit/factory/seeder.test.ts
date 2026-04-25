/**
 * @file seeder.test.ts
 * @description Unit tests for the Seeder abstract class. Verifies that run() must
 * be implemented by subclasses and that call() instantiates and runs child seeders.
 */

import { describe, it, expect } from 'vitest';
import { Seeder } from '@/seeder/seeder';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** Concrete child seeder that tracks whether it was run. */
class ChildSeeder extends Seeder {
  static ran = false;

  async run(): Promise<void> {
    ChildSeeder.ran = true;
  }
}

/** Parent seeder that delegates to ChildSeeder via call(). */
class ParentSeeder extends Seeder {
  async run(): Promise<void> {
    await this.call(ChildSeeder);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Seeder', () => {
  // -------------------------------------------------------------------------
  // run() is abstract
  // -------------------------------------------------------------------------

  it('run() is abstract and must be implemented by subclasses', () => {
    // Seeder is abstract — we cannot instantiate it directly.
    // Verify that a concrete subclass can be instantiated and has run().
    const seeder = new ChildSeeder();

    expect(typeof seeder.run).toBe('function');
  });

  it('Seeder cannot be instantiated directly (abstract class)', () => {
    // TypeScript prevents direct instantiation at compile time.
    // At runtime, we verify the prototype has no own run() implementation.
    expect(Seeder.prototype.run).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // call() — delegates to child seeder
  // -------------------------------------------------------------------------

  it('call(ChildSeeder) instantiates and runs the child seeder', async () => {
    ChildSeeder.ran = false;

    const parent = new ParentSeeder();
    await parent.run();

    expect(ChildSeeder.ran).toBe(true);
  });
});

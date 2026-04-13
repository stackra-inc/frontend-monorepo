/**
 * @file seeder.registry.ts
 * @description Registry for Seeder classes. Extends BaseRegistry to store
 * Seeder classes keyed by class name. Provides `seed()` to run all
 * registered seeders in order, or `seedOne()` for a specific seeder.
 *
 * @example
 * ```ts
 * const registry = new SeederRegistry();
 * registry.add(UserSeeder);
 * registry.add(PostSeeder);
 * await registry.seed(); // runs all in registration order
 * ```
 */

import { Injectable } from '@abdokouta/ts-container';
import { BaseRegistry } from '@abdokouta/ts-support';
import type { Seeder } from '../seeder/seeder';

/** A Seeder class constructor. */
type SeederClass = new () => Seeder;

// ---------------------------------------------------------------------------
// SeederRegistry
// ---------------------------------------------------------------------------

/**
 * Stores Seeder classes keyed by class name.
 * Instantiates and runs them on demand.
 */
@Injectable()
export class SeederRegistry extends BaseRegistry<SeederClass> {
  /** Ordered list preserving registration order. */
  private readonly ordered: SeederClass[] = [];

  /**
   * Register a Seeder class.
   */
  override add(_key: string, seederClass: SeederClass): void;
  add(seederClass: SeederClass): void;
  add(keyOrSeeder: string | SeederClass, maybeSeeder?: SeederClass): void {
    const seederClass = typeof keyOrSeeder === 'string' ? maybeSeeder! : keyOrSeeder;
    const name = seederClass.name;
    this.register(name, seederClass);
    this.ordered.push(seederClass);
  }

  /**
   * Register multiple Seeder classes at once.
   */
  addMany(classes: SeederClass[]): void {
    for (const cls of classes) {
      this.add(cls);
    }
  }

  /**
   * Run all registered seeders in registration order.
   * Each seeder is instantiated fresh.
   */
  async seed(): Promise<void> {
    for (const SeederClass of this.ordered) {
      const instance = new SeederClass();
      await instance.run();
    }
  }

  /**
   * Run a specific seeder by class.
   */
  async seedOne(seederClass: SeederClass): Promise<void> {
    const instance = new seederClass();
    await instance.run();
  }

  /**
   * Get all registered seeder classes in order.
   */
  getOrdered(): SeederClass[] {
    return [...this.ordered];
  }
}

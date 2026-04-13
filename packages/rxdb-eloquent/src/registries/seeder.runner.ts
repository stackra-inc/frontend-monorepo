/**
 * @file seeder.runner.ts
 * @description Collects and executes database seeders in registration order.
 *
 * The SeederRunner is created by `EloquentModule.forRoot()` and populated
 * by `EloquentModule.forFeature()`. Call `seed()` to run all registered
 * seeders, or `seed(SeederClass)` to run a specific one.
 *
 * @example
 * ```ts
 * const runner = new SeederRunner();
 * runner.add(UserSeeder);
 * runner.add(PostSeeder);
 * await runner.seed(); // runs all in order
 * ```
 */

import type { Seeder } from '../seeder/seeder';

/** A Seeder class constructor. */
type SeederClass = new () => Seeder;

/**
 * Collects Seeder classes and executes them on demand.
 *
 * Seeders run in the order they were added. Each seeder is instantiated
 * fresh on every `seed()` call.
 */
export class SeederRunner {
  /** Ordered list of registered Seeder classes. */
  private readonly seeders: SeederClass[] = [];

  /**
   * Add a Seeder class to the runner.
   *
   * @param seederClass - The Seeder class to register.
   *
   * @example
   * ```ts
   * runner.add(UserSeeder);
   * runner.add(PostSeeder);
   * ```
   */
  add(seederClass: SeederClass): void {
    this.seeders.push(seederClass);
  }

  /**
   * Add multiple Seeder classes at once.
   *
   * @param seederClasses - Array of Seeder classes.
   */
  addMany(seederClasses: SeederClass[]): void {
    for (const cls of seederClasses) {
      this.add(cls);
    }
  }

  /**
   * Run all registered seeders in order.
   *
   * Each seeder is instantiated and its `run()` method is called.
   * Errors in one seeder do not prevent subsequent seeders from running.
   *
   * @example
   * ```ts
   * await runner.seed();
   * ```
   */
  async seed(): Promise<void> {
    for (const SeederClass of this.seeders) {
      const instance = new SeederClass();
      await instance.run();
    }
  }

  /**
   * Run a specific seeder by class.
   *
   * @param seederClass - The Seeder class to run.
   *
   * @example
   * ```ts
   * await runner.seedOne(UserSeeder);
   * ```
   */
  async seedOne(seederClass: SeederClass): Promise<void> {
    const instance = new seederClass();
    await instance.run();
  }

  /**
   * Get the number of registered seeders.
   */
  count(): number {
    return this.seeders.length;
  }

  /**
   * Clear all registered seeders.
   */
  clear(): void {
    this.seeders.length = 0;
  }
}

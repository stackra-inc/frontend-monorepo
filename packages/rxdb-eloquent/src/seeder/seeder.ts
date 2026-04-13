/**
 * @file seeder.ts
 * @description Abstract Seeder base class for populating the database with
 * initial or test data in the rxdb-eloquent package.
 *
 * Seeders define a `run()` method that uses Factories or direct Model operations
 * to insert data. The `call()` method allows composing seeders — a parent seeder
 * can invoke child seeders for modular data population.
 *
 * @example
 * ```ts
 * import { Seeder } from 'rxdb-eloquent';
 *
 * class UserSeeder extends Seeder {
 *   async run(): Promise<void> {
 *     const factory = new UserFactory();
 *     await factory.count(50).create();
 *   }
 * }
 *
 * class DatabaseSeeder extends Seeder {
 *   async run(): Promise<void> {
 *     await this.call(UserSeeder);
 *     await this.call(PostSeeder);
 *   }
 * }
 *
 * // Execute:
 * const seeder = new DatabaseSeeder();
 * await seeder.run();
 * ```
 */

// ---------------------------------------------------------------------------
// Abstract Seeder
// ---------------------------------------------------------------------------

/**
 * Abstract base class for database seeders.
 *
 * Subclass this and implement `run()` to define the seeding logic.
 * Use `call()` to compose multiple seeders together.
 *
 * @example
 * ```ts
 * class PostSeeder extends Seeder {
 *   async run(): Promise<void> {
 *     await Post.create({ id: '1', title: 'First Post', body: 'Hello world' });
 *     await Post.create({ id: '2', title: 'Second Post', body: 'More content' });
 *   }
 * }
 * ```
 */
export abstract class Seeder {
  /**
   * Run the seeder.
   *
   * Implement this method to define the data population logic. Use
   * Factories, direct Model operations, or any other approach to
   * insert data into the database.
   *
   * @returns A void promise (seeders can be async).
   *
   * @example
   * ```ts
   * async run(): Promise<void> {
   *   const factory = new UserFactory();
   *   await factory.count(100).create();
   * }
   * ```
   */
  abstract run(): Promise<void>;

  /**
   * Call another seeder class.
   *
   * Instantiates the given Seeder class and executes its `run()` method.
   * This allows composing seeders for modular data population.
   *
   * @param SeederClass - The Seeder class to instantiate and run.
   * @returns A void promise that resolves when the child seeder completes.
   *
   * @example
   * ```ts
   * class DatabaseSeeder extends Seeder {
   *   async run(): Promise<void> {
   *     await this.call(UserSeeder);
   *     await this.call(PostSeeder);
   *     await this.call(CommentSeeder);
   *   }
   * }
   * ```
   */
  async call(SeederClass: new () => Seeder): Promise<void> {
    const seeder = new SeederClass();
    await seeder.run();
  }
}

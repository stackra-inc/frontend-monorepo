/**
 * @file factory.ts
 * @description Abstract Factory class for generating Model instances in the
 * rxdb-eloquent package. Inspired by Laravel's Eloquent Factories.
 *
 * Factories define a `definition()` method that returns default attribute values.
 * The `count()`, `state()`, `create()`, and `make()` methods provide a fluent API
 * for generating one or many model instances with optional overrides.
 *
 * - `make()` creates in-memory instances without persisting to the database.
 * - `create()` creates instances and persists them via `Model.create()`.
 *
 * @example
 * ```ts
 * import { Factory } from 'rxdb-eloquent';
 *
 * class UserFactory extends Factory<User> {
 *   protected model = User;
 *
 *   definition(): Record<string, any> {
 *     return {
 *       id: crypto.randomUUID(),
 *       name: 'Test User',
 *       email: `user-${Date.now()}@example.com`,
 *       age: 25,
 *     };
 *   }
 * }
 *
 * const factory = new UserFactory();
 *
 * // Make a single instance (in-memory only)
 * const user = factory.make();
 *
 * // Make 5 instances
 * const users = factory.count(5).make();
 *
 * // Create with overrides and persist
 * const admin = await factory.state({ role: 'admin' }).create();
 * ```
 */

// ---------------------------------------------------------------------------
// Abstract Factory
// ---------------------------------------------------------------------------

/**
 * Abstract base class for model factories.
 *
 * Subclass this and implement `definition()` to provide default attribute
 * values for your Model. Use `count()`, `state()`, `create()`, and `make()`
 * to generate instances.
 *
 * @typeParam T - The Model type this factory produces.
 *               Typed as `any` until Model generics are fully resolved.
 *               TODO: Replace with `T extends Model` once Model is finalized.
 *
 * @example
 * ```ts
 * class PostFactory extends Factory<Post> {
 *   protected model = Post;
 *
 *   definition(): Record<string, any> {
 *     return { id: crypto.randomUUID(), title: 'Test Post', body: 'Content' };
 *   }
 * }
 * ```
 */
export abstract class Factory<T = any> {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * The Model class this factory produces instances of.
   *
   * Subclasses must set this to the target Model class.
   * Typed as `any` until ModelStatic<T> generics are resolved.
   *
   * TODO: Replace `any` with `ModelStatic<T>` once Model is finalized.
   */
  protected abstract model: any;

  /**
   * The number of instances to generate.
   * @default 1
   * @internal
   */
  private _count: number = 1;

  /**
   * Attribute overrides to apply on top of the definition.
   * @internal
   */
  private _stateOverrides: Record<string, any> = {};

  // -------------------------------------------------------------------------
  // Abstract Methods
  // -------------------------------------------------------------------------

  /**
   * Define the default attribute values for the model.
   *
   * This method is called for each instance generated. Override it to
   * return a plain object with default attribute values.
   *
   * @returns A record of default attribute key-value pairs.
   *
   * @example
   * ```ts
   * definition(): Record<string, any> {
   *   return {
   *     id: crypto.randomUUID(),
   *     name: 'Default Name',
   *     email: `user-${Date.now()}@example.com`,
   *   };
   * }
   * ```
   */
  abstract definition(): Record<string, any>;

  // -------------------------------------------------------------------------
  // Fluent API
  // -------------------------------------------------------------------------

  /**
   * Set the number of instances to generate.
   *
   * @param n - The number of instances.
   * @returns `this` for chaining.
   *
   * @example
   * ```ts
   * const users = factory.count(10).make(); // 10 instances
   * ```
   */
  count(n: number): this {
    this._count = n;
    return this;
  }

  /**
   * Apply attribute overrides on top of the definition.
   *
   * Overrides are merged with the definition values — override keys
   * take precedence.
   *
   * @param overrides - Attribute overrides to apply.
   * @returns `this` for chaining.
   *
   * @example
   * ```ts
   * const admin = factory.state({ role: 'admin' }).make();
   * ```
   */
  state(overrides: Record<string, any>): this {
    this._stateOverrides = { ...this._stateOverrides, ...overrides };
    return this;
  }

  // -------------------------------------------------------------------------
  // Generation Methods
  // -------------------------------------------------------------------------

  /**
   * Create model instance(s) and persist them to the database.
   *
   * Calls `Model.create()` for each instance, which applies mass assignment
   * protection, timestamps, lifecycle events, and inserts into the collection.
   *
   * @returns A single instance if `count === 1`, or an array if `count > 1`.
   *
   * @example
   * ```ts
   * const user = await factory.create();           // Single
   * const users = await factory.count(5).create(); // Array of 5
   * ```
   */
  async create(): Promise<T | T[]> {
    const instances: T[] = [];
    const count = this._count;

    for (let i = 0; i < count; i++) {
      const attributes = this.buildAttributes();

      // Use Model.create() to persist
      if (typeof this.model.create === 'function') {
        const instance = await this.model.create(attributes);
        instances.push(instance);
      } else {
        // Fallback: create instance manually
        const instance = new this.model(attributes);
        instances.push(instance);
      }
    }

    // Reset state for next use
    this.resetState();

    return count === 1 ? instances[0]! : instances;
  }

  /**
   * Create model instance(s) in memory without persisting to the database.
   *
   * Instantiates the Model with the generated attributes but does not
   * call `save()` or `create()`.
   *
   * @returns A single instance if `count === 1`, or an array if `count > 1`.
   *
   * @example
   * ```ts
   * const user = factory.make();           // Single
   * const users = factory.count(3).make(); // Array of 3
   * ```
   */
  make(): T | T[] {
    const instances: T[] = [];
    const count = this._count;

    for (let i = 0; i < count; i++) {
      const attributes = this.buildAttributes();
      const instance = new this.model(attributes);
      instances.push(instance);
    }

    // Reset state for next use
    this.resetState();

    return count === 1 ? instances[0]! : instances;
  }

  // -------------------------------------------------------------------------
  // Private Helpers
  // -------------------------------------------------------------------------

  /**
   * Build the final attributes by merging definition with state overrides.
   *
   * @returns The merged attributes object.
   * @internal
   */
  private buildAttributes(): Record<string, any> {
    const base = this.definition();
    return { ...base, ...this._stateOverrides };
  }

  /**
   * Reset the count and state overrides to defaults.
   *
   * Called after `create()` or `make()` to ensure the factory is clean
   * for the next use.
   *
   * @internal
   */
  private resetState(): void {
    this._count = 1;
    this._stateOverrides = {};
  }
}

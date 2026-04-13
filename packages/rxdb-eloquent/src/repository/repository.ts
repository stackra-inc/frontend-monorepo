/**
 * @file repository.ts
 * @description Generic Repository base class for the rxdb-eloquent package.
 *
 * Provides a thin CRUD abstraction over Model static methods. The Repository
 * pattern decouples business logic from data access, making it easier to
 * test and swap implementations.
 *
 * Each Repository is bound to a specific Model class and delegates all
 * operations to that Model's static finders and instance methods.
 *
 * @example
 * ```ts
 * import { Repository } from 'rxdb-eloquent';
 *
 * class UserRepository extends Repository<User> {
 *   constructor() {
 *     super(User);
 *   }
 *
 *   // Custom query methods
 *   async findByEmail(email: string): Promise<User | null> {
 *     return this.model.query().where('email', '=', email).first();
 *   }
 * }
 *
 * const repo = new UserRepository();
 * const user = await repo.find('abc-123');
 * const all = await repo.findAll();
 * const created = await repo.create({ name: 'Alice' });
 * ```
 */

// ---------------------------------------------------------------------------
// Generic Repository
// ---------------------------------------------------------------------------

/**
 * Generic Repository providing standard CRUD operations for a Model.
 *
 * Delegates to the Model's static methods (`find`, `create`, `all`, `query`)
 * and instance methods (`save`, `delete`).
 *
 * @typeParam T - The Model type this repository manages.
 *               Typed as `any` until Model generics are fully resolved.
 *               TODO: Replace with `T extends Model` once Model is finalized.
 *
 * @example
 * ```ts
 * class PostRepository extends Repository<Post> {
 *   constructor() {
 *     super(Post);
 *   }
 * }
 *
 * const repo = new PostRepository();
 * const posts = await repo.findAll();
 * ```
 */
export class Repository<T = any> {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * The Model class this repository operates on.
   *
   * Typed as `any` until ModelStatic<T> generics are resolved.
   * TODO: Replace with `ModelStatic<T>` once Model is finalized.
   */
  protected readonly model: any;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new Repository bound to the given Model class.
   *
   * @param model - The Model class constructor.
   *
   * @example
   * ```ts
   * const repo = new Repository(User);
   * ```
   */
  constructor(model: any) {
    this.model = model;
  }

  // -------------------------------------------------------------------------
  // CRUD Operations
  // -------------------------------------------------------------------------

  /**
   * Find a model instance by its primary key.
   *
   * Delegates to `Model.find(id)`.
   *
   * @param id - The primary key value.
   * @returns A promise resolving to the found instance, or `null`.
   *
   * @example
   * ```ts
   * const user = await repo.find('abc-123');
   * ```
   */
  async find(id: string): Promise<T | null> {
    return this.model.find(id);
  }

  /**
   * Retrieve all model instances.
   *
   * Delegates to `Model.all()`.
   *
   * @returns A promise resolving to an array of all instances.
   *
   * @example
   * ```ts
   * const users = await repo.findAll();
   * ```
   */
  async findAll(): Promise<T[]> {
    return this.model.all();
  }

  /**
   * Create a new model instance and persist it.
   *
   * Delegates to `Model.create(attributes)`.
   *
   * @param attributes - The attributes for the new instance.
   * @returns A promise resolving to the created instance.
   *
   * @example
   * ```ts
   * const user = await repo.create({ name: 'Alice', email: 'alice@example.com' });
   * ```
   */
  async create(attributes: Record<string, any>): Promise<T> {
    return this.model.create(attributes);
  }

  /**
   * Update an existing model instance by ID.
   *
   * Finds the model by ID, applies the attribute updates, and saves.
   * Returns the updated instance, or `null` if not found.
   *
   * @param id         - The primary key of the instance to update.
   * @param attributes - The attributes to update.
   * @returns A promise resolving to the updated instance, or `null`.
   *
   * @example
   * ```ts
   * const updated = await repo.update('abc-123', { name: 'Bob' });
   * ```
   */
  async update(id: string, attributes: Record<string, any>): Promise<T | null> {
    const instance = await this.model.find(id);

    if (!instance) {
      return null;
    }

    // Apply attribute updates
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof instance.setAttribute === 'function') {
        instance.setAttribute(key, value);
      }
    }

    // Save the updated instance
    if (typeof instance.save === 'function') {
      await instance.save();
    }

    return instance;
  }

  /**
   * Delete a model instance by ID.
   *
   * Finds the model by ID and calls `delete()` on it.
   * Does nothing if the instance is not found.
   *
   * @param id - The primary key of the instance to delete.
   *
   * @example
   * ```ts
   * await repo.delete('abc-123');
   * ```
   */
  async delete(id: string): Promise<void> {
    const instance = await this.model.find(id);

    if (instance && typeof instance.delete === 'function') {
      await instance.delete();
    }
  }
}

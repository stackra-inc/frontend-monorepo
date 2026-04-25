/**
 * @file service.ts
 * @description Abstract Service base class for the rxdb-eloquent package.
 *
 * Services encapsulate business logic and accept Repository instances via
 * their constructor. This pattern separates concerns: Repositories handle
 * data access, Services handle business rules and orchestration.
 *
 * @example
 * ```ts
 * import { Service } from 'rxdb-eloquent';
 * import type { Repository } from 'rxdb-eloquent';
 *
 * class UserService extends Service {
 *   private get userRepo(): UserRepository {
 *     return this.repositories.users as UserRepository;
 *   }
 *
 *   async registerUser(data: { name: string; email: string }): Promise<User> {
 *     // Business logic: validate, transform, then persist
 *     if (!data.email.includes('@')) {
 *       throw new Error('Invalid email');
 *     }
 *     return this.userRepo.create(data);
 *   }
 *
 *   async deactivateUser(id: string): Promise<void> {
 *     const user = await this.userRepo.find(id);
 *     if (user) {
 *       user.setAttribute('active', false);
 *       await user.save();
 *     }
 *   }
 * }
 *
 * // Usage:
 * const service = new UserService({ users: new UserRepository() });
 * await service.registerUser({ name: 'Alice', email: 'alice@example.com' });
 * ```
 */

import type { Repository } from '@/repository/repository';

// ---------------------------------------------------------------------------
// Abstract Service
// ---------------------------------------------------------------------------

/**
 * Abstract base class for business logic services.
 *
 * Accepts a map of Repository instances via the constructor. Subclasses
 * implement domain-specific methods that orchestrate data access through
 * the injected repositories.
 *
 * @example
 * ```ts
 * class OrderService extends Service {
 *   async placeOrder(userId: string, items: OrderItem[]): Promise<Order> {
 *     const user = await this.repositories.users.find(userId);
 *     if (!user) throw new Error('User not found');
 *
 *     return this.repositories.orders.create({
 *       user_id: userId,
 *       items,
 *       status: 'pending',
 *     });
 *   }
 * }
 * ```
 */
export abstract class Service {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  /**
   * Map of Repository instances injected via the constructor.
   *
   * Keys are logical names (e.g., `'users'`, `'posts'`), values are
   * Repository instances. Subclasses access these to perform data operations.
   *
   * @example
   * ```ts
   * // In a subclass:
   * const user = await this.repositories.users.find(id);
   * ```
   */
  protected readonly repositories: Record<string, Repository<any>>;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  /**
   * Create a new Service with the given repositories.
   *
   * @param repositories - A map of named Repository instances.
   *
   * @example
   * ```ts
   * const service = new MyService({
   *   users: new UserRepository(),
   *   posts: new PostRepository(),
   * });
   * ```
   */
  constructor(repositories: Record<string, Repository<any>>) {
    this.repositories = repositories;
  }
}

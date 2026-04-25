/**
 * @file observer.ts
 * @description Abstract base class for Model lifecycle observers in the rxdb-eloquent package.
 *
 * An Observer listens to Model lifecycle events (creating, created, updating, updated,
 * deleting, deleted, restoring, restored) by implementing the corresponding optional methods.
 * Observers are registered on a Model class via the `@ObservedBy(ObserverClass)` decorator.
 *
 * When a lifecycle event fires, the HasEvents concern checks if the registered Observer
 * has a method matching the event name and invokes it with the Model instance.
 *
 * Pre-event methods (creating, updating, deleting, restoring) can return `false` to
 * cancel the operation.
 *
 * @example
 * ```ts
 * import { Observer } from './observer';
 *
 * class UserObserver extends Observer {
 *   creating(model: any): boolean | void {
 *     // Validate before insert — return false to cancel
 *     if (!model.getAttribute('email')) {
 *       return false;
 *     }
 *   }
 *
 *   created(model: any): void {
 *     console.log('User created:', model.getAttribute('id'));
 *   }
 * }
 * ```
 */

// ---------------------------------------------------------------------------
// Observer Base Class
// ---------------------------------------------------------------------------

/**
 * Abstract base class for Model lifecycle observers.
 *
 * Subclass this and implement any of the optional lifecycle methods to react
 * to Model events. Register the observer on a Model via `@ObservedBy(MyObserver)`.
 *
 * All methods are optional — only implement the ones you need. Pre-event methods
 * (`creating`, `updating`, `deleting`, `restoring`) can return `false` to cancel
 * the corresponding operation.
 *
 * @example
 * ```ts
 * class AuditObserver extends Observer {
 *   created(model: any): void {
 *     console.log(`[AUDIT] Created ${model.constructor.name}`);
 *   }
 *
 *   updated(model: any): void {
 *     console.log(`[AUDIT] Updated ${model.constructor.name}`);
 *   }
 *
 *   deleted(model: any): void {
 *     console.log(`[AUDIT] Deleted ${model.constructor.name}`);
 *   }
 * }
 * ```
 */
export abstract class Observer {
  /**
   * Called before a new document is inserted.
   * Return `false` to cancel the insert operation.
   *
   * @param model - The Model instance being created.
   *                Typed as `any` until the Model layer is fully built.
   *                TODO: Replace with `Model` once available.
   * @returns `false` to cancel, or `void`/`true` to proceed.
   *
   * @example
   * ```ts
   * creating(model: any): boolean | void {
   *   if (!model.getAttribute('name')) return false;
   * }
   * ```
   */
  creating?(model: any): boolean | void;

  /**
   * Called after a new document has been inserted.
   *
   * @param model - The Model instance that was created.
   *
   * @example
   * ```ts
   * created(model: any): void {
   *   sendWelcomeEmail(model.getAttribute('email'));
   * }
   * ```
   */
  created?(model: any): void;

  /**
   * Called before an existing document is updated.
   * Return `false` to cancel the update operation.
   *
   * @param model - The Model instance being updated.
   * @returns `false` to cancel, or `void`/`true` to proceed.
   *
   * @example
   * ```ts
   * updating(model: any): boolean | void {
   *   if (model.getAttribute('locked')) return false;
   * }
   * ```
   */
  updating?(model: any): boolean | void;

  /**
   * Called after an existing document has been updated.
   *
   * @param model - The Model instance that was updated.
   */
  updated?(model: any): void;

  /**
   * Called before a document is deleted (or soft-deleted).
   * Return `false` to cancel the delete operation.
   *
   * @param model - The Model instance being deleted.
   * @returns `false` to cancel, or `void`/`true` to proceed.
   *
   * @example
   * ```ts
   * deleting(model: any): boolean | void {
   *   if (model.getAttribute('is_admin')) return false;
   * }
   * ```
   */
  deleting?(model: any): boolean | void;

  /**
   * Called after a document has been deleted (or soft-deleted).
   *
   * @param model - The Model instance that was deleted.
   */
  deleted?(model: any): void;

  /**
   * Called before a soft-deleted document is restored.
   * Return `false` to cancel the restore operation.
   * Only relevant for Models with `@SoftDeletes()`.
   *
   * @param model - The Model instance being restored.
   * @returns `false` to cancel, or `void`/`true` to proceed.
   */
  restoring?(model: any): boolean | void;

  /**
   * Called after a soft-deleted document has been restored.
   * Only relevant for Models with `@SoftDeletes()`.
   *
   * @param model - The Model instance that was restored.
   */
  restored?(model: any): void;
}

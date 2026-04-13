/**
 * @file mass-assignment.error.ts
 * @description Error thrown when strict mode is enabled and a
 * mass-assignment attempt includes a guarded attribute.
 * By default (non-strict), guarded attributes are silently
 * ignored during mass assignment (matching Laravel behavior).
 * This error is only thrown when the developer opts into
 * strict mass-assignment protection.
 */

/**
 * Thrown in strict mode when attempting to mass-assign
 * an attribute that is not in the Model's fillable list
 * or is explicitly guarded.
 *
 * @example
 * ```ts
 * throw new MassAssignmentError('role', 'User');
 * // Error: Attribute "role" is not mass-assignable on model "User".
 * ```
 */
export class MassAssignmentError extends Error {
  /**
   * The attribute key that was rejected during mass assignment.
   */
  public readonly key: string;

  /**
   * The name of the Model class where the violation occurred.
   */
  public readonly model: string;

  /**
   * @param key - The attribute name that failed mass-assignment check
   * @param model - The Model class name (e.g. 'User')
   */
  constructor(key: string, model: string) {
    super(`Attribute "${key}" is not mass-assignable on model "${model}".`);
    this.key = key;
    this.model = model;
    Object.setPrototypeOf(this, MassAssignmentError.prototype);
  }
}

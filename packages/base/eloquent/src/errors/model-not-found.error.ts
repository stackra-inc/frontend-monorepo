/**
 * @file model-not-found.error.ts
 * @description Error thrown when a Model lookup by primary key
 * fails to find a matching document. This is used by methods
 * like `findOrFail()` that expect a document to exist.
 * Regular `find()` returns null instead of throwing.
 */

/**
 * Thrown when a document lookup by primary key returns no result
 * and the caller expects the document to exist.
 *
 * @example
 * ```ts
 * throw new ModelNotFoundError('User', 'abc-123');
 * // Error: Model "User" not found for id "abc-123".
 * ```
 */
export class ModelNotFoundError extends Error {
  /**
   * The name of the Model class that was queried.
   */
  public readonly model: string;

  /**
   * The primary key value that was searched for.
   */
  public readonly id: string;

  /**
   * @param model - The Model class name (e.g. 'User')
   * @param id - The primary key value that was not found
   */
  constructor(model: string, id: string) {
    super(`Model "${model}" not found for id "${id}".`);
    this.model = model;
    this.id = id;
    Object.setPrototypeOf(this, ModelNotFoundError.prototype);
  }
}

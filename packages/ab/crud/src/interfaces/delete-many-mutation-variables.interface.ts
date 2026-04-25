/**
 * @fileoverview Variables passed to the delete-many mutation.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Variables passed to the delete-many mutation.
 */
export interface DeleteManyMutationVariables {
  /** Array of record identifiers. */
  ids: (string | number)[];
}

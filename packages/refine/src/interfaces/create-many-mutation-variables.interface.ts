/**
 * @fileoverview Variables passed to the create-many mutation.
 *
 * @module @abdokouta/react-refine
 * @category Interfaces
 */

/**
 * Variables passed to the create-many mutation.
 */
export interface CreateManyMutationVariables<TData = any> {
  /** Array of partial data for new records. */
  values: Partial<TData>[];
}

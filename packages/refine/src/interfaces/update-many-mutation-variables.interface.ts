/**
 * @fileoverview Variables passed to the update-many mutation.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Variables passed to the update-many mutation.
 */
export interface UpdateManyMutationVariables<TData = any> {
  /** Array of record identifiers. */
  ids: (string | number)[];
  /** Partial data to apply to all records. */
  values: Partial<TData>;
}

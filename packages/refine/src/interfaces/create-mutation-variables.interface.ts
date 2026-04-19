/**
 * @fileoverview Variables passed to the create mutation.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Variables passed to the create mutation.
 */
export interface CreateMutationVariables<TData = any> {
  /** Partial data for the new record. */
  values: Partial<TData>;
}

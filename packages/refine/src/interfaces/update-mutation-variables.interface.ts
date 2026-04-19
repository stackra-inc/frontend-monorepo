/**
 * @fileoverview Variables passed to the update mutation.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Variables passed to the update mutation.
 */
export interface UpdateMutationVariables<TData = any> {
  /** Record identifier. */
  id: string | number;
  /** Partial data to update. */
  values: Partial<TData>;
}

/**
 * @fileoverview Props for the useMany hook.
 *
 * @module @stackra-inc/react-refine
 * @category Interfaces
 */

/**
 * Props for the `useMany` hook.
 */
export interface UseManyProps {
  /** Resource name string. */
  resource: string;
  /** Array of record identifiers. */
  ids: (string | number)[];
  /** Whether the query is enabled. */
  enabled?: boolean;
  /** Arbitrary metadata. */
  meta?: Record<string, any>;
}

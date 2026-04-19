/**
 * @fileoverview Props for the useShow hook.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Props for the `useShow` hook.
 */
export interface UseShowProps {
  /** Resource name string. */
  resource: string;
  /** Record identifier. */
  id: string | number;
  /** Whether the query is enabled. */
  enabled?: boolean;
  /** Arbitrary metadata. */
  meta?: Record<string, any>;
}

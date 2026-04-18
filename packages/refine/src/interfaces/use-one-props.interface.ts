/**
 * @fileoverview Props for the useOne hook.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

/**
 * Props for the `useOne` hook.
 */
export interface UseOneProps {
  /** Resource name string. */
  resource: string;
  /** Record identifier. */
  id: string | number;
  /** Whether the query is enabled. */
  enabled?: boolean;
  /** Arbitrary metadata. */
  meta?: Record<string, any>;
}

/**
 * @fileoverview Props for the useCustom hook.
 *
 * @module @stackra/react-refine
 * @category Interfaces
 */

import type { CustomParams } from './custom-params.interface';

/**
 * Props for the `useCustom` hook.
 */
export interface UseCustomProps {
  /** Resource name string. */
  resource: string;
  /** Custom operation parameters. */
  params: CustomParams;
  /** Whether the query is enabled. */
  enabled?: boolean;
}

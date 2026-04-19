/**
 * @fileoverview Return type for the useShow hook.
 *
 * @module @stackra-inc/react-refine
 * @category Types
 */

import type { UseQueryHookResult } from '@/interfaces/use-query-hook-result.interface';
import type { HttpError } from '@/interfaces/http-error.interface';

/** Return type for the `useShow` hook. */
export type UseShowReturnType<TData = any> = UseQueryHookResult<TData, HttpError>;
